import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { contestId, problemId, answer } = await req.json();

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
    const isUpsolve = !session.user.isAdmin && now > contest.endTime;

    if (!isUpsolve) {
        // During contest: block resubmission if already solved
        const existingContestSolve = await prisma.submission.findFirst({
            where: { userId: session.user.id, problemId, isCorrect: true, isUpsolve: false },
        });
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

    const submission = await prisma.submission.create({
        data: {
            userId: session.user.id,
            contestId,
            problemId,
            answer,
            isCorrect,
            isUpsolve,
        }
    });

    return NextResponse.json({
        id: submission.id,
        isCorrect: submission.isCorrect,
        isUpsolve: submission.isUpsolve,
    });
}
