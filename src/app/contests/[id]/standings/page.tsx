<<<<<<< HEAD
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
                                {contest.problems.map((p: any, i: number) => (
                                    <th key={p.id} className="p-3 text-center min-w-[80px]">
                                        <div className="text-xs uppercase text-muted-foreground">Problem</div>
                                        #{i + 1}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((row: any, i: number) => (
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
=======
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import React from 'react';

export default async function StandingsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const contest = await prisma.contest.findUnique({
        where: { id: params.id },
        include: {
            problems: { orderBy: { id: 'asc' } },
            submissions: { orderBy: { createdAt: 'asc' } },
            registrations: { include: { user: { select: { id: true, username: true, displayName: true, rating: true } } } },
            ratingHistory: true,
            teams: {
                include: {
                    members: {
                        include: { user: { select: { id: true, username: true, displayName: true } } },
                    },
                },
            },
        }
    });

    if (!contest) notFound();

    const now = new Date();
    const isLive = now >= contest.startTime && now <= contest.endTime;
    const isTeamContest = (contest as any).contestType === 'team' || (contest as any).contestType === 'relay';

    // Rating delta map (userId -> change) — only shown after individual contests
    const ratingDeltaMap = new Map<string, number>();
    (contest as any).ratingHistory?.forEach((h: any) => ratingDeltaMap.set(h.userId, h.change));
    const ratingsCalculated = !isTeamContest && ratingDeltaMap.size > 0;

    const problemLabels = (contest as any).problems.map((_: unknown, i: number) =>
        i < 26 ? String.fromCharCode(65 + i) : `A${i - 25}`
    );

    const contestDurationMins = Math.floor((contest.endTime.getTime() - contest.startTime.getTime()) / 60000);

    // Filter to live (non-upsolve) submissions within the contest window
    const liveSubs = (contest as any).submissions.filter((s: any) =>
        !s.isUpsolve && s.createdAt >= contest.startTime && s.createdAt <= contest.endTime
    );

    // Compact duration formatter
    const formatMins = (totalMins: number) => {
        if (totalMins < 0) return '-';
        if (totalMins === 0) return '<1m';
        const d = Math.floor(totalMins / 1440);
        const h = Math.floor((totalMins % 1440) / 60);
        const m = totalMins % 60;
        if (d > 0) return `${d}d${h > 0 ? ` ${h}h` : ''}`;
        if (h > 0) return `${h}h${String(m).padStart(2, '0')}m`;
        return `${m}m`;
    };

    const elapsedMins = (date: Date) =>
        Math.max(0, Math.min(Math.floor((date.getTime() - contest.startTime.getTime()) / 60000), contestDurationMins));

    // Build per-problem stats for a set of submissions belonging to one entity
    type ProblemStat = { solved: boolean; solveTime: Date | null; waPenalty: number };
    const buildEntityStats = (subs: any[]): Record<string, ProblemStat> => {
        const problems: Record<string, ProblemStat> = {};
        const sorted = [...subs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        for (const sub of sorted) {
            const pid = sub.problemId;
            if (!problems[pid]) problems[pid] = { solved: false, solveTime: null, waPenalty: 0 };
            const ps = problems[pid];
            if (ps.solved) continue;
            if (sub.isCorrect) {
                ps.solved = true;
                ps.solveTime = sub.createdAt;
            } else {
                ps.waPenalty += 5;
            }
        }
        return problems;
    };

    const problemPointsMap = new Map<string, number>(
        (contest as any).problems.map((p: any) => [p.id, p.points] as [string, number])
    );

    // ICPC scoring: for each solved problem, add elapsedMins(solveTime) + WA penalty
    const computeScore = (problems: Record<string, ProblemStat>) => {
        let solvedCount = 0;
        let totalTime = 0;
        let totalScore = 0;
        for (const [pid, ps] of Object.entries(problems)) {
            if (!ps.solved) continue;
            solvedCount++;
            totalTime += elapsedMins(ps.solveTime!) + ps.waPenalty;
            totalScore += problemPointsMap.get(pid) ?? 0;
        }
        return { solvedCount, totalTime, totalScore };
    };

    // First solve per problem → entity key (teamId or userId)
    const firstSolveMap = new Map<string, string>();
    for (const sub of liveSubs) {
        if (!sub.isCorrect) continue;
        const key = isTeamContest ? (sub.teamId ?? sub.userId) : sub.userId;
        if (!firstSolveMap.has(sub.problemId)) firstSolveMap.set(sub.problemId, key);
    }

    let standings: any[];

    if (isTeamContest) {
        const subsByTeam = new Map<string, any[]>();
        for (const sub of liveSubs) {
            const key = sub.teamId ?? sub.userId;
            if (!subsByTeam.has(key)) subsByTeam.set(key, []);
            subsByTeam.get(key)!.push(sub);
        }
        standings = (contest as any).teams.map((team: any) => {
            const subs = subsByTeam.get(team.id) ?? [];
            const problems = buildEntityStats(subs);
            const { solvedCount, totalTime, totalScore } = computeScore(problems);
            return { key: team.id, name: team.name, members: team.members, problems, solvedCount, totalTime, totalScore };
        });
    } else {
        const subsByUser = new Map<string, any[]>();
        for (const sub of liveSubs) {
            if (!subsByUser.has(sub.userId)) subsByUser.set(sub.userId, []);
            subsByUser.get(sub.userId)!.push(sub);
        }
        standings = (contest as any).registrations.map((reg: any) => {
            const subs = subsByUser.get(reg.userId) ?? [];
            const problems = buildEntityStats(subs);
            const { solvedCount, totalTime, totalScore } = computeScore(problems);
            return { key: reg.userId, user: reg.user, problems, solvedCount, totalTime, totalScore };
        });
        // Also include unregistered submitters (edge case)
        const seenKeys = new Set(standings.map((s: any) => s.key));
        for (const sub of liveSubs) {
            if (seenKeys.has(sub.userId)) continue;
            seenKeys.add(sub.userId);
            const subs = subsByUser.get(sub.userId) ?? [];
            const problems = buildEntityStats(subs);
            const { solvedCount, totalTime, totalScore } = computeScore(problems);
            standings.push({ key: sub.userId, user: sub.user ?? { username: '?', displayName: null, rating: null, id: sub.userId }, problems, solvedCount, totalTime, totalScore });
        }
    }

    standings.sort((a, b) =>
        b.totalScore !== a.totalScore ? b.totalScore - a.totalScore :
        b.solvedCount !== a.solvedCount ? b.solvedCount - a.solvedCount :
        a.totalTime - b.totalTime
    );

    return (
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1300px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            {/* Page header */}
            <div className="fade-in" style={{ marginBottom: '36px' }}>
                <Link href={`/contests/${contest.id}`} className="btn btn-ghost btn-sm" style={{ marginBottom: '20px' }}>
                    ← Back to Contest
                </Link>
                <p className="sec-label" style={{ marginTop: '20px' }}>CONTEST STANDINGS</p>
                {isTeamContest && (
                    <p className="sec-label" style={{ marginTop: '4px', color: 'var(--sage)' }}>
                        {(contest as any).contestType === 'relay' ? 'RELAY' : 'TEAM'} MODE
                    </p>
                )}
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
                    <Link href={`/contests/${contest.id}/all-submissions`} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--ff-mono)', textDecoration: 'none', letterSpacing: '0.05em', color: 'var(--ink4)' }}>
                        All Submissions
                    </Link>
                </div>
            </div>

            {standings.length === 0 ? (
                <div className="g fade-in-d">
                    <div className="empty">
                        <div className="empty-title">No participants yet</div>
                        <div className="empty-body">Standings will appear once {isTeamContest ? 'teams form' : 'users register'} and make submissions.</div>
                    </div>
                </div>
            ) : (
                <div className="g fade-in-d" style={{ overflow: 'auto', padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: `${520 + (contest as any).problems.length * 72}px` }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.025)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                                <th style={th('left', '40px')}>#</th>
                                <th style={th('left')}>{isTeamContest ? 'TEAM' : 'SOLVER'}</th>
                                <th style={th('center', '60px')}>SLV.</th>
                                <th style={th('center', '80px')}>SCORE</th>
                                <th style={th('center', '90px')}>TIME</th>
                                {ratingsCalculated && <th style={th('center', '80px')}>Δ RATING</th>}
                                {(contest as any).problems.map((_: unknown, i: number) => (
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

                                return (
                                    <tr key={row.key} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', animation: `fade-in 0.4s ${i * 0.03}s both` }}>
                                        {/* Rank */}
                                        <td style={td('left')}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', fontWeight: 600, color: rankColor }}>
                                                {rank}
                                            </span>
                                        </td>

                                        {/* Entity name */}
                                        <td style={td('left')}>
                                            {isTeamContest ? (
                                                <details style={{ cursor: 'pointer' }}>
                                                    <summary style={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div className="avatar avatar-sm" style={{ background: rank <= 3 ? 'rgba(184,133,58,0.12)' : 'rgba(107,148,120,0.10)', flexShrink: 0, fontFamily: 'var(--ff-mono)', fontSize: '11px' }}>
                                                            {(row.name as string).slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <span className="lb-name">{row.name}</span>
                                                    </summary>
                                                    <div style={{ paddingTop: '6px', paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {(row.members as any[]).map((m: any) => (
                                                            <div key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <Link href={`/user/${m.user.username}`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--sage)', textDecoration: 'none' }}>
                                                                    {m.user.username}
                                                                </Link>
                                                                {m.role === 'leader' && (
                                                                    <span style={{ fontSize: '9px', fontFamily: 'var(--ff-mono)', color: 'var(--ink5)', letterSpacing: '0.1em' }}>LEADER</span>
                                                                )}
                                                                {m.relayOrder != null && (
                                                                    <span style={{ fontSize: '9px', fontFamily: 'var(--ff-mono)', color: 'var(--ink5)', letterSpacing: '0.1em' }}>SLOT {m.relayOrder}</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </details>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div className="avatar avatar-sm" style={{ background: rank <= 3 ? 'rgba(184,133,58,0.12)' : 'rgba(107,148,120,0.10)', flexShrink: 0 }}>
                                                        {(row.user.username as string).slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <Link href={`/user/${row.user.username}`} className="lb-name" style={{ textDecoration: 'none' }}>
                                                            {row.user.username}
                                                        </Link>
                                                        <div className="lb-sub-info">{row.user.rating} rating</div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        {/* Solved count */}
                                        <td style={td('center')}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '15px', fontWeight: 700, color: row.solvedCount > 0 ? 'var(--ink)' : 'var(--ink5)' }}>
                                                {row.solvedCount}
                                            </span>
                                        </td>

                                        {/* Total score (XP) */}
                                        <td style={td('center')}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', fontWeight: 600, color: row.totalScore > 0 ? 'var(--sage)' : 'var(--ink5)' }}>
                                                {row.totalScore > 0 ? row.totalScore : '-'}
                                            </span>
                                        </td>

                                        {/* Total time */}
                                        <td style={td('center')}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: row.solvedCount > 0 ? 'var(--ink3)' : 'var(--ink5)', whiteSpace: 'nowrap' }}>
                                                {row.solvedCount > 0 ? (row.totalTime === 0 ? '0m' : formatMins(row.totalTime)) : '-'}
                                            </span>
                                        </td>

                                        {/* Rating delta (individual only) */}
                                        {ratingsCalculated && (() => {
                                            const delta = ratingDeltaMap.get(row.key);
                                            return (
                                                <td style={td('center')}>
                                                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', fontWeight: 700, color: delta === undefined ? 'var(--ink5)' : delta > 0 ? 'var(--sage)' : delta < 0 ? 'var(--rose)' : 'var(--ink5)' }}>
                                                        {delta === undefined ? '-' : `${delta > 0 ? '+' : ''}${delta}`}
                                                    </span>
                                                </td>
                                            );
                                        })()}

                                        {/* Per-problem cells */}
                                        {(contest as any).problems.map((p: any) => {
                                            const ps: ProblemStat | undefined = row.problems[p.id];
                                            const isFirstSolve = ps?.solved && firstSolveMap.get(p.id) === row.key;
                                            const cellStyle: React.CSSProperties = {
                                                ...td('center'),
                                                verticalAlign: 'top',
                                            };
                                            if (!ps) return <td key={p.id} style={cellStyle} />;
                                            const waCount = Math.round(ps.waPenalty / 5);

                                            if (ps.solved) return (
                                                <td key={p.id} style={cellStyle}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '6px 0' }}>
                                                        <div style={{
                                                            width: '32px', height: '32px', borderRadius: '50%',
                                                            background: isFirstSolve ? 'rgba(184,133,58,0.85)' : 'var(--sage)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontFamily: 'var(--ff-mono)', fontSize: '12px', fontWeight: 700, color: '#fff',
                                                        }}>
                                                            {waCount > 0 ? `+${waCount}` : '✓'}
                                                        </div>
                                                        {ps.solveTime && (
                                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', color: isFirstSolve ? '#b87a28' : 'var(--ink4)', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                                                                {formatMins(elapsedMins(ps.solveTime))}
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
                                                            {waCount > 0 ? waCount : '-'}
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
>>>>>>> LATESTTHISONE-NEWMODES
