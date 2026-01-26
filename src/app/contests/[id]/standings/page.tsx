import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function StandingsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const contest = await prisma.contest.findUnique({
        where: { id: params.id },
        include: {
            problems: true,
            submissions: { include: { user: true }, orderBy: { createdAt: 'asc' } },
            registrations: { include: { user: true } }
        }
    });

    if (!contest) notFound();

    // Calculate standings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userStats = new Map<string, any>();

    // Initialize all registered users with 0 score
    contest.registrations.forEach((reg: any) => {
        userStats.set(reg.userId, {
            user: reg.user,
            problems: {},
            score: 0,
        });
    });

    // Process submissions
    contest.submissions.forEach((sub: any) => {
        if (!userStats.has(sub.userId)) {
            // User submitted but didn't register (shouldn't happen, but handle it)
            userStats.set(sub.userId, {
                user: sub.user,
                problems: {},
                score: 0,
            });
        }
        const stats = userStats.get(sub.userId);

        if (!stats.problems[sub.problemId]) {
            stats.problems[sub.problemId] = { attempts: 0, solved: false, solveTime: null };
        }
        const pStats = stats.problems[sub.problemId];

        if (pStats.solved) return; // Already solved

        if (sub.isCorrect) {
            pStats.solved = true;
            pStats.attempts++;
            pStats.solveTime = sub.createdAt;

            const problem = contest.problems.find((p: any) => p.id === sub.problemId);
            if (problem) {
                const penalty = (pStats.attempts - 1) * 10;
                const earned = Math.max(problem.points * 0.3, problem.points - penalty);
                stats.score += earned;
                pStats.earned = earned;
            }
        } else {
            pStats.attempts++;
        }
    });

    const standings = Array.from(userStats.values()).sort((a, b) => b.score - a.score);

    // Helper to format solve time relative to contest start
    const formatSolveTime = (solveTime: Date) => {
        const diff = solveTime.getTime() - contest.startTime.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Standings: {contest.title}</h1>
                <Link href={`/contests/${contest.id}`} className="btn btn-outline">Back to Contest</Link>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-muted/50">
                            <tr className="border-b">
                                <th className="p-3 pl-4">Rank</th>
                                <th className="p-3">User</th>
                                <th className="p-3 font-bold">Total Score</th>
                                {contest.problems.map((p, i) => (
                                    <th key={p.id} className="p-3 text-center min-w-[80px]">
                                        <div className="text-xs uppercase text-muted-foreground">Problem</div>
                                        #{i + 1}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((row, i) => (
                                <tr key={row.user.id} className="border-b hover:bg-muted/30 transition-colors">
                                    <td className="p-3 pl-4 font-bold text-muted-foreground">#{i + 1}</td>
                                    <td className="p-3 font-medium">
                                        <Link href={`/user/${row.user.username}`} className="hover:text-primary hover:underline">
                                            {row.user.username}
                                        </Link>
                                        <div className="text-xs text-muted-foreground">{row.user.rating} Rating</div>
                                    </td>
                                    <td className="p-3 font-bold text-xl text-primary">{Math.round(row.score)}</td>
                                    {contest.problems.map((p: any) => {
                                        const pStat = row.problems[p.id];
                                        if (!pStat) return <td key={p.id} className="p-3 text-center text-muted-foreground">-</td>;

                                        if (pStat.solved) return (
                                            <td key={p.id} className="p-3 text-center">
                                                <div className="font-bold text-green-600">+{Math.round(pStat.earned)}</div>
                                                {pStat.attempts > 1 && (
                                                    <div className="text-xs text-red-500">(-{pStat.attempts - 1})</div>
                                                )}
                                                {pStat.solveTime && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {formatSolveTime(pStat.solveTime)}
                                                    </div>
                                                )}
                                            </td>
                                        );

                                        return (
                                            <td key={p.id} className="p-3 text-center">
                                                <div className="text-red-500 font-medium">
                                                    -{pStat.attempts * 10}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            {standings.length === 0 && (
                                <tr>
                                    <td colSpan={3 + contest.problems.length} className="p-8 text-center text-muted-foreground">
                                        No registered users yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
