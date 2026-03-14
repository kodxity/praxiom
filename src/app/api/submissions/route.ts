import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit, rateLimitResponse, getIp } from "@/lib/rateLimit";

const submitSchema = z.object({
    contestId: z.string().min(1).max(100),
    problemId: z.string().min(1).max(100),
    answer: z.string().min(1, 'Answer cannot be empty').max(1000, 'Answer too long').trim(),
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Per-user rate limit: 30 submissions per minute
    const rlKey = `submit:user:${session.user.id}`;
    if (!checkRateLimit(rlKey, { windowMs: 60_000, max: 30 })) {
        return rateLimitResponse();
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const result = submitSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const { contestId, problemId, answer } = result.data;

    const problem = await prisma.problem.findUnique({
        where: { id: problemId }
    });

    if (!problem || problem.contestId !== contestId) {
        return new NextResponse("Invalid problem", { status: 400 });
    }

    // Check if contest is active (unless admin)
    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) return new NextResponse("Contest not found", { status: 404 });

    const now = new Date();
    // Block if contest hasn't started yet
    if (!session.user.isAdmin && now < contest.startTime) {
        return new NextResponse("Contest hasn't started yet", { status: 403 });
    }

    // Mark as upsolve if submitting after contest ended (not counted for ratings)
    let isUpsolve = !session.user.isAdmin && now > contest.endTime;

    // ── Team/relay checks ──────────────────────────────────────────────────
    let teamId: string | null = null;
    let personalStartTime: Date | null = null;

    if (!session.user.isAdmin && !isUpsolve && contest.contestType !== 'individual') {
        // Must be a member of a team for this contest
        const membership = await prisma.contestTeamMember.findFirst({
            where: { userId: session.user.id, team: { contestId } },
            include: { team: true },
        });

        if (!membership) {
            return new NextResponse('You must be on a team to submit in this contest.', { status: 403 });
        }
        
        personalStartTime = membership.team.startTime;
        teamId = membership.teamId;

        if (!isUpsolve) {
            if (!personalStartTime) {
                return new NextResponse('You must start the contest before submitting.', { status: 403 });
            }
            const personalEndTime = new Date(personalStartTime.getTime() + contest.duration * 60000);
            if (now > personalEndTime) {
                isUpsolve = true;
            }
        }

        if (!isUpsolve && contest.contestType === 'relay') {
            // Validate relay slot authorization
            const allProblems = await prisma.problem.findMany({
                where: { contestId },
                orderBy: { id: 'asc' },
                select: { id: true },
            });

            if (allProblems.length !== 3) {
                return new NextResponse('Relay contest must have exactly 3 problems.', { status: 400 });
            }

            const problemIndex = allProblems.findIndex(p => p.id === problemId); // 0-indexed -> slot = index+1
            if (problemIndex === -1) return new NextResponse("Invalid problem", { status: 400 });
            const requiredSlot = problemIndex + 1;

            if (membership.relayOrder !== requiredSlot) {
                return NextResponse.json({
                    error: `As slot ${membership.relayOrder ?? 'unassigned'}, you may only submit problem ${membership.relayOrder}.`,
                }, { status: 403 });
            }

            // Check prerequisite solved
            if (requiredSlot > 1) {
                const prevProblemId = allProblems[requiredSlot - 2].id;
                const prevSolved = await prisma.submission.findFirst({
                    where: { teamId: membership.teamId, problemId: prevProblemId, isCorrect: true, isUpsolve: false },
                });
                if (!prevSolved) {
                    return NextResponse.json({
                        error: `Problem ${requiredSlot - 1} must be solved first.`,
                    }, { status: 403 });
                }
            }
        }

        teamId = membership.teamId;
    }

    // During an active individual contest, only registered users may submit
    if (!session.user.isAdmin && !isUpsolve && contest.contestType === 'individual') {
        const reg = await prisma.registration.findUnique({
            where: { userId_contestId: { userId: session.user.id, contestId } },
        });
        if (!reg) {
            return new NextResponse('You must register for this contest to submit.', { status: 403 });
        }
        personalStartTime = reg.startTime;

        if (!personalStartTime) {
            return new NextResponse('You must start the contest before submitting.', { status: 403 });
        }
        const personalEndTime = new Date(personalStartTime.getTime() + contest.duration * 60000);
        if (now > personalEndTime) {
            isUpsolve = true;
        }
    }

    // Sequential lock enforcement for individual contests
    if (!isUpsolve && !session.user.isAdmin && contest.contestType === 'individual') {
        const allProblems = await prisma.problem.findMany({
            where: { contestId },
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const problemIndex = allProblems.findIndex(p => p.id === problemId);
        if (problemIndex > 0) {
            const solvedIds = new Set(
                (await prisma.submission.findMany({
                    where: { userId: session.user.id, contestId, isCorrect: true, isUpsolve: false },
                    select: { problemId: true },
                })).map(s => s.problemId)
            );
            const firstUnsolved = allProblems.findIndex(p => !solvedIds.has(p.id));
            if (firstUnsolved !== -1 && problemIndex > firstUnsolved) {
                return new NextResponse("Problem is locked. Solve earlier problems first.", { status: 403 });
            }
        }
    }

    if (!isUpsolve) {
        // During contest: block resubmission if already solved
        // For team/relay: check team solve; for individual: check user solve
        const solveWhere = teamId
            ? { teamId, problemId, isCorrect: true, isUpsolve: false }
            : { userId: session.user.id, problemId, isCorrect: true, isUpsolve: false };

        const existingContestSolve = await prisma.submission.findFirst({ where: solveWhere });
        if (existingContestSolve) {
            return NextResponse.json({ id: existingContestSolve.id, isCorrect: true, isUpsolve: false, alreadySolved: true });
        }
    } else {
        // Upsolving: allow even if solved during contest, but block duplicate upsolves
        const existingUpsolveSolve = await prisma.submission.findFirst({
            where: { userId: session.user.id, problemId, isCorrect: true, isUpsolve: true },
        });
        if (existingUpsolveSolve) {
            return NextResponse.json({ id: existingUpsolveSolve.id, isCorrect: true, isUpsolve: true, alreadySolved: true });
        }
    }

    const isCorrect = problem.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase();

    // Check if user revealed the hint for this problem
    const hintReveal = await prisma.hintReveal.findUnique({
        where: { userId_problemId: { userId: session.user.id, problemId } },
    });
    const hintUsed = !!hintReveal;

    // Award XP for the first ever correct solve of this problem (contest or upsolve)
    let xpAwarded = 0;
    if (isCorrect) {
        const alreadySolvedAny = await prisma.submission.findFirst({
            where: { userId: session.user.id, problemId, isCorrect: true },
        });
        if (!alreadySolvedAny) {
            xpAwarded = problem.points;
            await prisma.user.update({
                where: { id: session.user.id },
                data: { xp: { increment: xpAwarded } },
            });
        }
    }

    const submission = await prisma.submission.create({
        data: {
            userId: session.user.id,
            contestId,
            problemId,
            teamId: teamId || null,
            answer,
            isCorrect,
            isUpsolve,
            hintUsed,
        }
    });

    return NextResponse.json({
        id: submission.id,
        isCorrect: submission.isCorrect,
        xpAwarded,
        isUpsolve: submission.isUpsolve,
        hintUsed: submission.hintUsed,
    });
}
