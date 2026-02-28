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
    if (!session.user.isAdmin && (now < contest.startTime || now > contest.endTime)) {
        return new NextResponse("Contest is not active", { status: 403 });
    }

    const isCorrect = problem.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase();

    const submission = await prisma.submission.create({
        data: {
            userId: session.user.id,
            contestId,
            problemId,
            answer,
            isCorrect
        }
    });

    return NextResponse.json({
        id: submission.id,
        isCorrect: submission.isCorrect
    });
}
