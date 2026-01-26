import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const contestId = params.id;
    const contest = await prisma.contest.findUnique({
        where: { id: contestId },
        include: {
            problems: true,
            submissions: true
        }
    });

    if (!contest) return new NextResponse("Contest not found", { status: 404 });

    const existingHistory = await prisma.ratingHistory.findFirst({ where: { contestId } });
    if (existingHistory) {
        return NextResponse.json({ message: "Ratings already calculated" }, { status: 400 });
    }

    // Get unique participants
    const userIds = [...new Set(contest.submissions.map((s: any) => s.userId))];

    // Calculate scores per user
    const participants = [];
    for (const userId of userIds) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) continue;

        let score = 0;
        const userSubs = contest.submissions.filter((s: any) => s.userId === userId);

        // Logic same as Standings:
        // For each problem, checking validation.
        contest.problems.forEach((problem: any) => {
            const pSubs = userSubs.filter((s: any) => s.problemId === problem.id);
            // Check if solved
            const solvedSub = pSubs.find((s: any) => s.isCorrect);
            if (solvedSub) {
                // Determine attempts until solved
                // Filter subs before solved time
                const attempts = pSubs.filter((s: any) => s.createdAt <= solvedSub.createdAt).length;
                const penalty = (attempts - 1) * 10;
                const earned = Math.max(problem.points * 0.3, problem.points - penalty);
                score += earned;
            }
        });

        participants.push({
            userId,
            oldRating: user.rating,
            score
        });
    }

    // Sort by score descending
    participants.sort((a, b) => b.score - a.score);

    // ELO Calc (K=32 simple pairwise)
    const K = 32;
    const changes: Record<string, number> = {};
    participants.forEach((p: any) => changes[p.userId] = 0);

    // Only compare if more than 1 participant
    if (participants.length > 1) {
        for (let i = 0; i < participants.length; i++) {
            for (let j = i + 1; j < participants.length; j++) {
                const pA = participants[i];
                const pB = participants[j];

                // Expected score for A against B
                const ea = 1 / (1 + Math.pow(10, (pB.oldRating - pA.oldRating) / 400));
                const eb = 1 / (1 + Math.pow(10, (pA.oldRating - pB.oldRating) / 400));

                // Actual score
                let sa = 0.5, sb = 0.5;
                if (pA.score > pB.score) { sa = 1; sb = 0; }
                else if (pA.score < pB.score) { sa = 0; sb = 1; }

                // For simplicity, we apply updates immediately to the delta buffer
                // Normally we normalize by N-1? 
                // With Pairwise sum, default K results in huge swings if N is large.
                // Standard approach: K / (N-1) for pairwise?
                // Or just K * (Actual - Expected) one vs all?
                // Codeforces uses much more complex logic.
                // I'll use a simpler approximation:
                // Change = K * (ActualRank - ExpectedRank)?
                // Let's use pairwise div by N-1 to keep it stable.
                const weight = 1 / (participants.length - 1);

                changes[pA.userId] += K * weight * (sa - ea) * 5; // Multiplier to make it feel "real"
                changes[pB.userId] += K * weight * (sb - eb) * 5;
            }
        }
    }

    // Apply updates
    await prisma.$transaction(async (tx) => {
        for (const p of participants) {
            const change = Math.round(changes[p.userId]);
            const newRating = p.oldRating + change;

            await tx.ratingHistory.create({
                data: {
                    userId: p.userId,
                    contestId,
                    oldRating: p.oldRating,
                    newRating,
                    change
                }
            });

            await tx.user.update({
                where: { id: p.userId },
                data: { rating: newRating }
            });
        }

        await tx.contest.update({
            where: { id: contestId },
            data: { status: 'ENDED' }
        });
    });

    return NextResponse.json({ success: true, count: participants.length });
}
