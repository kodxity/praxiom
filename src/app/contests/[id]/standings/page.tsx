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
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            {/* Page header */}
            <div className="fade-in" style={{ marginBottom: '36px' }}>
                <Link href={`/contests/${contest.id}`} className="btn btn-ghost btn-sm" style={{ marginBottom: '20px' }}>
                    ← Back to Contest
                </Link>
                <p className="sec-label" style={{ marginTop: '20px' }}>CONTEST STANDINGS</p>
                <h1 style={{
                    fontFamily: 'var(--ff-display)', fontStyle: 'italic',
                    fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 400, color: 'var(--ink)',
                    lineHeight: 1.15, letterSpacing: '-0.01em', marginTop: '8px',
                }}>
                    {contest.title}
                </h1>
            </div>

            {/* Standings table */}
            {standings.length === 0 ? (
                <div className="g fade-in-d">
                    <div className="empty">
                        <div className="empty-title">No participants yet</div>
                        <div className="empty-body">Standings will appear once users register and make submissions.</div>
                    </div>
                </div>
            ) : (
                <div className="g fade-in-d" style={{ overflow: 'auto', padding: 0 }}>

                    {/* Column headers */}
                    <div style={{
                        display: 'grid',
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        gridTemplateColumns: `48px 1fr 88px${contest.problems.map((_: any) => ' 76px').join('')}`,
                        padding: '10px 20px',
                        borderBottom: '1px solid rgba(0,0,0,0.07)',
                        fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.14em',
                        color: 'var(--ink5)', textTransform: 'uppercase',
                        background: 'rgba(0,0,0,0.02)',
                    }}>
                        <span>#</span>
                        <span>SOLVER</span>
                        <span style={{ textAlign: 'right', paddingRight: '6px' }}>SCORE</span>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {contest.problems.map((_: any, i: number) => (
                            <span key={i} style={{ textAlign: 'center' }}>P{i + 1}</span>
                        ))}
                    </div>

                    {/* Data rows */}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {standings.map((row: any, i: number) => {
                        const rank = i + 1;
                        const rankColor =
                            rank === 1 ? '#b87a28' :
                            rank === 2 ? '#7a90a8' :
                            rank === 3 ? '#a06848' : 'var(--ink4)';
                        const initials = (row.user.username as string).slice(0, 2).toUpperCase();

                        return (
                            <div
                                key={row.user.id}
                                className="lb-row"
                                style={{
                                    display: 'grid',
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    gridTemplateColumns: `48px 1fr 88px${contest.problems.map((_: any) => ' 76px').join('')}`,
                                    padding: '11px 20px',
                                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                                    alignItems: 'center',
                                    animation: `fade-in 0.4s ${i * 0.03}s both`,
                                }}
                            >
                                {/* Rank */}
                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', fontWeight: 500, color: rankColor }}>
                                    #{rank}
                                </span>

                                {/* User */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="avatar avatar-sm" style={{
                                        background: rank <= 3 ? 'rgba(184,133,58,0.12)' : 'rgba(107,148,120,0.10)',
                                        flexShrink: 0,
                                    }}>
                                        {initials}
                                    </div>
                                    <div>
                                        <Link href={`/user/${row.user.username}`} className="lb-name" style={{ textDecoration: 'none' }}>
                                            {row.user.username}
                                        </Link>
                                        <div className="lb-sub-info">{row.user.rating} rating</div>
                                    </div>
                                </div>

                                {/* Total score */}
                                <span style={{
                                    fontFamily: 'var(--ff-display)', fontStyle: 'italic',
                                    fontSize: '20px', color: 'var(--ink)',
                                    textAlign: 'right', paddingRight: '6px',
                                }}>
                                    {Math.round(row.score)}
                                </span>

                                {/* Per-problem cells */}
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {contest.problems.map((p: any) => {
                                    const pStat = row.problems[p.id];

                                    if (!pStat) return (
                                        <span key={p.id} style={{ textAlign: 'center', fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink5)' }}>-</span>
                                    );

                                    if (pStat.solved) return (
                                        <div key={p.id} style={{ textAlign: 'center' }}>
                                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--sage)' }}>
                                                +{Math.round(pStat.earned)}
                                            </div>
                                            {pStat.attempts > 1 && (
                                                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--rose)' }}>
                                                    {pStat.attempts - 1}✗
                                                </div>
                                            )}
                                            {pStat.solveTime && (
                                                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', color: 'var(--ink5)', marginTop: '1px' }}>
                                                    {formatSolveTime(pStat.solveTime)}
                                                </div>
                                            )}
                                        </div>
                                    );

                                    return (
                                        <div key={p.id} style={{ textAlign: 'center', fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--rose)' }}>
                                            −{pStat.attempts * 10}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    )
}
