import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

// POST /api/hints  - purchase a hint for a problem
// Returns { hint: string } on success
// Returns 402 if not enough XP
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // 10 hint reveals per minute per user
    if (!checkRateLimit(`hint:user:${session.user.id}`, { windowMs: 60_000, max: 10 })) {
        return rateLimitResponse();
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const { problemId } = body as { problemId?: unknown };
    if (typeof problemId !== 'string' || problemId.trim().length === 0) {
        return NextResponse.json({ error: 'problemId required' }, { status: 400 });
    }

    // Verify problem exists and has a hint
    const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        select: { id: true, hint: true, points: true, contestId: true },
    });
    if (!problem) return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    if (!problem.hint) return NextResponse.json({ error: 'No hint for this problem' }, { status: 404 });

    const hintCost = Math.floor(problem.points / 2);

    // During an active contest, only registered users may purchase hints
    const contestForCheck = await prisma.contest.findUnique({
        where: { id: problem.contestId },
        select: { startTime: true, endTime: true },
    });
    if (contestForCheck && !session.user.isAdmin) {
        const now = new Date();
        const isActive = now >= contestForCheck.startTime && now <= contestForCheck.endTime;
        if (isActive) {
            const reg = await prisma.registration.findUnique({
                where: { userId_contestId: { userId: session.user.id, contestId: problem.contestId } },
            });
            if (!reg) {
                return NextResponse.json(
                    { error: 'You must register for this contest to use hints.' },
                    { status: 403 }
                );
            }
        }
    }

    // Already revealed? Return hint text for free (idempotent)
    const existing = await prisma.hintReveal.findUnique({
        where: { userId_problemId: { userId: session.user.id, problemId } },
    });
    if (existing) {
        return NextResponse.json({ hint: problem.hint, alreadyRevealed: true });
    }

    // Check XP balance
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true },
    });
    if (!user) return new NextResponse('User not found', { status: 404 });

    if (user.xp < hintCost) {
        return NextResponse.json(
            { error: `Not enough XP. You have ${user.xp} XP but need ${hintCost} XP.`, userXp: user.xp, hintCost },
            { status: 402 }
        );
    }

    // Deduct XP and record the reveal atomically
    await prisma.$transaction([
        prisma.user.update({
            where: { id: session.user.id },
            data: { xp: { decrement: hintCost } },
        }),
        prisma.hintReveal.create({
            data: { userId: session.user.id, problemId },
        }),
    ]);

    return NextResponse.json({ hint: problem.hint, newXp: user.xp - hintCost });
}
