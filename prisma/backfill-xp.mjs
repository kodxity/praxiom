// One-time script to backfill user.xp from submission history.
// XP = sum of points from first correct non-upsolve solve per problem
//     minus total hint costs (floor(points/2) per hint purchased).
// Run with: node prisma/backfill-xp.mjs

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({ select: { id: true, username: true } });

    for (const user of users) {
        // Correct submissions (any, including upsolves), ordered by time
        const subs = await prisma.submission.findMany({
            where: { userId: user.id, isCorrect: true },
            orderBy: { createdAt: 'asc' },
            select: { problemId: true, problem: { select: { points: true } } },
        });

        // Only count the first correct solve per problem
        const seen = new Set();
        let earned = 0;
        for (const s of subs) {
            if (!seen.has(s.problemId)) {
                seen.add(s.problemId);
                earned += s.problem.points;
            }
        }

        // Subtract hint costs
        const hints = await prisma.hintReveal.findMany({
            where: { userId: user.id },
            select: { problem: { select: { points: true } } },
        });
        const spent = hints.reduce((sum, h) => sum + Math.floor(h.problem.points / 2), 0);

        const xp = Math.max(0, earned - spent);
        await prisma.user.update({ where: { id: user.id }, data: { xp } });
        console.log(`${user.username}: earned=${earned} spent=${spent} → xp=${xp}`);
    }

    console.log('\nDone.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
