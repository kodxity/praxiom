import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function StandingsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const contest = await prisma.contest.findUnique({
        where: { id: params.id },
        include: {
            problems: { orderBy: { id: 'asc' } },
            submissions: { include: { user: true }, orderBy: { createdAt: 'asc' } },
            registrations: { include: { user: true } },
            ratingHistory: true,
        }
    });

    if (!contest) notFound();

    const now = new Date();
    const isLive = now >= contest.startTime && now <= contest.endTime;

    // Build rating delta map (userId -> change) - only shown after contest
    const ratingDeltaMap = new Map<string, number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (contest as any).ratingHistory?.forEach((h: any) => {
        ratingDeltaMap.set(h.userId, h.change);
    });
    const ratingsCalculated = ratingDeltaMap.size > 0;

    // Problem label letters: A, B, C, ...
    const problemLabels = contest.problems.map((_: unknown, i: number) =>
        i < 26 ? String.fromCharCode(65 + i) : `A${i - 25}`
    );

    const contestDurationMins = Math.floor((contest.endTime.getTime() - contest.startTime.getTime()) / 60000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userStats = new Map<string, any>();

    contest.registrations.forEach((reg: any) => {
        userStats.set(reg.userId, { user: reg.user, problems: {}, solvedCount: 0, totalTime: 0 });
    });

    contest.submissions.forEach((sub: any) => {
        // only count live (non-upsolve) submissions within the contest window
        if (sub.isUpsolve) return;
        if (sub.createdAt < contest.startTime || sub.createdAt > contest.endTime) return;
        if (!userStats.has(sub.userId)) {
            userStats.set(sub.userId, { user: sub.user, problems: {}, solvedCount: 0, totalTime: 0 });
        }
        const stats = userStats.get(sub.userId);
        if (!stats.problems[sub.problemId]) {
            stats.problems[sub.problemId] = { attempts: 0, solved: false, solveTime: null };
        }
        const pStats = stats.problems[sub.problemId];
        if (pStats.solved) return;

        if (sub.isCorrect) {
            pStats.solved = true;
            pStats.attempts++;
            pStats.solveTime = sub.createdAt;
            stats.solvedCount++;
            // totalTime = sum of capped solve times (clamped to contest window)
                const rawMins = Math.floor((sub.createdAt.getTime() - contest.startTime.getTime()) / 60000);
                stats.totalTime += Math.max(0, Math.min(rawMins, contestDurationMins));
        } else {
            pStats.attempts++;
        }
    });

    // Sort: most solved first, then least total time
    const standings = Array.from(userStats.values()).sort((a, b) =>
        b.solvedCount !== a.solvedCount ? b.solvedCount - a.solvedCount : a.totalTime - b.totalTime
    );

    // Compact duration formatter: "45m" / "1h20m" / "2d3h"
    const formatMins = (totalMins: number) => {
        if (totalMins <= 0) return '-';
        const d = Math.floor(totalMins / 1440);
        const h = Math.floor((totalMins % 1440) / 60);
        const m = totalMins % 60;
        if (d > 0) return `${d}d${h > 0 ? ` ${h}h` : ''}`;
        if (h > 0) return `${h}h${String(m).padStart(2, '0')}m`;
        return `${m}m`;
    };

    const formatTime = (solveTime: Date) => {
        const mins = Math.floor((solveTime.getTime() - contest.startTime.getTime()) / 60000);
        if (mins < 0 || mins > contestDurationMins) return '-';
        return formatMins(mins);
    };

    const numProblems = contest.problems.length;
    void numProblems; // used in table minWidth calculation only

    return (
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1300px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

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
                {isLive && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '3px 10px', borderRadius: '99px', background: 'var(--sage-bg)', border: '1px solid var(--sage-border)' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sage)', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--sage)', letterSpacing: '0.1em' }}>LIVE</span>
                    </div>
                )}

                {/* Tab nav */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '20px' }}>
                    <span style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.05em', color: 'var(--ink)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        Standings
                    </span>
                    <Link href={`/contests/${contest.id}/submissions`} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--ff-mono)', textDecoration: 'none', letterSpacing: '0.05em', color: 'var(--ink4)' }}>
                        Submissions
                    </Link>
                </div>
            </div>

            {standings.length === 0 ? (
                <div className="g fade-in-d">
                    <div className="empty">
                        <div className="empty-title">No participants yet</div>
                        <div className="empty-body">Standings will appear once users register and make submissions.</div>
                    </div>
                </div>
            ) : (
                <div className="g fade-in-d" style={{ overflow: 'auto', padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: `${520 + contest.problems.length * 72}px` }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.025)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                                <th style={th('left', '40px')}>  #  </th>
                                <th style={th('left')}>SOLVER</th>
                                <th style={th('center', '60px')}>SLV.</th>
                                <th style={th('center', '90px')}>TIME</th>
                                {ratingsCalculated && <th style={th('center', '80px')}>Δ RATING</th>}
                                {contest.problems.map((_: unknown, i: number) => (
                                    <th key={i} style={th('center', '72px')}>{problemLabels[i]}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((row: any, i: number) => {
                                const rank = i + 1;
                                const rankColor =
                                    rank === 1 ? '#b87a28' :
                                    rank === 2 ? '#7a90a8' :
                                    rank === 3 ? '#a06848' : 'var(--ink4)';
                                const initials = (row.user.username as string).slice(0, 2).toUpperCase();

                                return (
                                    <tr key={row.user.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', animation: `fade-in 0.4s ${i * 0.03}s both` }}>
                                        {/* Rank */}
                                        <td style={td('left')}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', fontWeight: 600, color: rankColor }}>
                                                {rank}
                                            </span>
                                        </td>

                                        {/* User */}
                                        <td style={td('left')}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div className="avatar avatar-sm" style={{ background: rank <= 3 ? 'rgba(184,133,58,0.12)' : 'rgba(107,148,120,0.10)', flexShrink: 0 }}>
                                                    {initials}
                                                </div>
                                                <div>
                                                    <Link href={`/user/${row.user.username}`} className="lb-name" style={{ textDecoration: 'none' }}>
                                                        {row.user.username}
                                                    </Link>
                                                    <div className="lb-sub-info">{row.user.rating} rating</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Solved count */}
                                        <td style={td('center')}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '15px', fontWeight: 700, color: row.solvedCount > 0 ? 'var(--ink)' : 'var(--ink5)' }}>
                                                {row.solvedCount}
                                            </span>
                                        </td>

                                        {/* Total time */}
                                        <td style={td('center')}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: row.solvedCount > 0 ? 'var(--ink3)' : 'var(--ink5)', whiteSpace: 'nowrap' }}>
                                                {formatMins(row.totalTime)}
                                            </span>
                                        </td>

                                        {/* Rating delta */}
                                        {ratingsCalculated && (() => {
                                            const delta = ratingDeltaMap.get(row.user.id);
                                            return (
                                                <td style={td('center')}>
                                                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', fontWeight: 700, color: delta === undefined ? 'var(--ink5)' : delta > 0 ? 'var(--sage)' : delta < 0 ? 'var(--rose)' : 'var(--ink5)' }}>
                                                        {delta === undefined ? '-' : `${delta > 0 ? '+' : ''}${delta}`}
                                                    </span>
                                                </td>
                                            );
                                        })()}

                                        {/* Per-problem cells */}
                                        {contest.problems.map((p: any) => {
                                            const pStat = row.problems[p.id];
                                            const cellStyle = { ...td('center'), verticalAlign: 'top' as const };
                                            if (!pStat) return <td key={p.id} style={cellStyle} />;

                                            if (pStat.solved) return (
                                                <td key={p.id} style={cellStyle}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '6px 0' }}>
                                                        <div style={{
                                                            width: '32px', height: '32px', borderRadius: '50%',
                                                            background: 'var(--sage)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontFamily: 'var(--ff-mono)', fontSize: '12px', fontWeight: 700, color: '#fff',
                                                        }}>
                                                            {pStat.attempts}
                                                        </div>
                                                        {pStat.solveTime && (
                                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', color: 'var(--ink4)', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                                                                {formatTime(pStat.solveTime)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            );

                                            return (
                                                <td key={p.id} style={cellStyle}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '6px 0' }}>
                                                        <div style={{
                                                            width: '32px', height: '32px', borderRadius: '50%',
                                                            background: 'rgba(184,96,78,0.12)',
                                                            border: '1.5px solid var(--rose)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontFamily: 'var(--ff-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--rose)',
                                                        }}>
                                                            {pStat.attempts}
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function th(align: 'left' | 'center' | 'right', width?: string): React.CSSProperties {
    return {
        padding: '9px 12px',
        textAlign: align,
        fontFamily: 'var(--ff-mono)',
        fontSize: '9px',
        letterSpacing: '0.14em',
        color: 'var(--ink5)',
        textTransform: 'uppercase',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        ...(width ? { width, minWidth: width } : {}),
    };
}

function td(align: 'left' | 'center' | 'right'): React.CSSProperties {
    return {
        padding: '10px 12px',
        textAlign: align,
        verticalAlign: 'middle',
    };
}
