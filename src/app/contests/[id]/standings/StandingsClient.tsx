'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface Props {
    contest: any;
    initialStandings: any[];
    firstSolveMap: Record<string, string>;
    ratingDeltaMap: Record<string, number>;
    viewerReg?: { id: string; startTime: string; isVirtual: boolean } | null;
}

export function StandingsClient({ contest, initialStandings, firstSolveMap, ratingDeltaMap, viewerReg }: Props) {
    const [filter, setFilter] = useState<'all' | 'live'>('all');
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 5000);
        return () => clearInterval(id);
    }, []);

    const isTeamContest = contest.contestType === 'team' || contest.contestType === 'relay';
    const contestStartTime = new Date(contest.startTime);
    const contestEndTime = new Date(contest.endTime);
    const contestDurationMins = contest.duration;

    // Calculate simulated elapsed time if the viewer is in a virtual contest
    const simulatedElapsedMs = useMemo(() => {
        if (!viewerReg?.isVirtual || !viewerReg.startTime) return null;
        const start = new Date(viewerReg.startTime);
        const elapsed = now.getTime() - start.getTime();
        if (elapsed < 0) return 0;
        if (elapsed > contestDurationMins * 60000) return contestDurationMins * 60000;
        return elapsed;
    }, [viewerReg, now, contestDurationMins]);

    const processedStandings = useMemo(() => {
        let rows = initialStandings;

        // 1. Filter by Live/All
        if (filter === 'live') {
            rows = rows.filter(r => !r.isVirtual);
        }

        // 2. Simulation Logic
        if (simulatedElapsedMs !== null) {
            // Re-calculate stats for everyone based on submissions that happened within T elapsed time.
            // For original live participants, 'start' is contest.startTime.
            // For virtual participants, 'start' is their registration.startTime.
            
            const problemPointsMap = new Map<string, number>(
                contest.problems.map((p: any) => [p.id, p.points] as [string, number])
            );

            rows = rows.map(row => {
                const entityStart = new Date(row.startTime || contest.startTime);
                // Filter submissions for this specific registration/entity that happened within the simulated window
                // We need the raw submissions for this entity. 
                // Since initialStandings has 'problems' (calculated stats), we need to check the actual submissions.
                
                // Let's find all submissions in contest.submissions that belong to this registration/ID
                const entitySubs = contest.submissions.filter((s: any) => {
                    const isCorrectEntity = isTeamContest ? s.teamId === row.key : s.registrationId === row.registrationId;
                    if (!isCorrectEntity) return false;
                    
                    const subTime = new Date(s.createdAt);
                    const elapsed = subTime.getTime() - entityStart.getTime();
                    return elapsed <= simulatedElapsedMs;
                });

                // Re-build stats
                const problems: Record<string, any> = {};
                const sorted = [...entitySubs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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

                // Compute score
                let solvedCount = 0;
                let totalTime = 0;
                let totalScore = 0;
                for (const [pid, ps] of Object.entries(problems)) {
                    if (!ps.solved) continue;
                    solvedCount++;
                    const solveTime = new Date(ps.solveTime);
                    const elapsed = Math.floor((solveTime.getTime() - entityStart.getTime()) / 60000);
                    totalTime += elapsed + ps.waPenalty;
                    totalScore += problemPointsMap.get(pid) ?? 0;
                }

                return { ...row, problems, solvedCount, totalTime, totalScore };
            });
        }

        // Sort
        return [...rows].sort((a, b) =>
            b.totalScore !== a.totalScore ? b.totalScore - a.totalScore :
            b.solvedCount !== a.solvedCount ? b.solvedCount - a.solvedCount :
            a.totalTime - b.totalTime
        );
    }, [initialStandings, filter, simulatedElapsedMs, viewerReg, contest, isTeamContest]);

    const problemLabels = contest.problems.map((_: any, i: number) =>
        i < 26 ? String.fromCharCode(65 + i) : `A${i - 25}`
    );

    const ratingsCalculated = !isTeamContest && Object.keys(ratingDeltaMap).length > 0;

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

    const elapsedMinsFromStart = (subTime: string, entityStart?: string | null) => {
        const s = new Date(subTime);
        const st = entityStart ? new Date(entityStart) : new Date(contest.startTime);
        return Math.max(0, Math.min(Math.floor((s.getTime() - st.getTime()) / 60000), contestDurationMins));
    };

    const tabLink: React.CSSProperties = {
        padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
        fontFamily: 'var(--ff-mono)', textDecoration: 'none',
        color: 'var(--ink4)', letterSpacing: '0.05em',
    };
    const tabActive: React.CSSProperties = {
        ...tabLink,
        color: 'var(--ink)', background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.1)',
    };

    return (
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1300px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>
            {/* Page Header */}
            <div className="fade-in" style={{ marginBottom: '36px' }}>
                <Link href={`/contests/${contest.id}`} className="btn btn-ghost btn-sm" style={{ marginBottom: '20px' }}>
                    ← Back to Contest
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <p className="sec-label" style={{ marginTop: '20px' }}>CONTEST STANDINGS</p>
                        <h1 style={{
                            fontFamily: 'var(--ff-display)', fontStyle: 'italic',
                            fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 400, color: 'var(--ink)',
                            lineHeight: 1.15, letterSpacing: '-0.01em', marginTop: '8px',
                        }}>
                            {contest.title}
                        </h1>
                        {simulatedElapsedMs !== null && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '4px 12px', borderRadius: '99px', background: 'rgba(120,80,200,0.1)', border: '1px solid rgba(120,80,200,0.2)' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9b78e8', animation: 'pulse 1.4s ease infinite' }} />
                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: '#9b78e8', fontWeight: 600 }}>SIMULATING: {formatMins(Math.floor(simulatedElapsedMs/60000))} / {contestDurationMins}m</span>
                            </div>
                        )}
                    </div>

                    {/* Filter Toggles */}
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <button 
                            onClick={() => setFilter('all')}
                            style={{ 
                                padding: '6px 16px', borderRadius: '7px', fontSize: '12px', fontFamily: 'var(--ff-ui)', fontWeight: 500,
                                background: filter === 'all' ? '#fff' : 'transparent',
                                color: filter === 'all' ? 'var(--ink)' : 'var(--ink4)',
                                boxShadow: filter === 'all' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                cursor: 'pointer', border: 'none'
                             }}
                        >All Participation</button>
                        <button 
                            onClick={() => setFilter('live')}
                            style={{ 
                                padding: '6px 16px', borderRadius: '7px', fontSize: '12px', fontFamily: 'var(--ff-ui)', fontWeight: 500,
                                background: filter === 'live' ? '#fff' : 'transparent',
                                color: filter === 'live' ? 'var(--ink)' : 'var(--ink4)',
                                boxShadow: filter === 'live' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                cursor: 'pointer', border: 'none'
                             }}
                        >Live Only</button>
                    </div>
                </div>

                {/* Tab nav */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '20px' }}>
                    <span style={tabActive}>Standings</span>
                    <Link href={`/contests/${contest.id}/submissions`} style={tabLink}>Submissions</Link>
                    <Link href={`/contests/${contest.id}/all-submissions`} style={tabLink}>All Submissions</Link>
                </div>
            </div>

            {processedStandings.length === 0 ? (
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
                                <th style={th('left', '40px')}>#</th>
                                <th style={th('left')}>{isTeamContest ? 'TEAM' : 'SOLVER'}</th>
                                <th style={th('center', '60px')}>SLV.</th>
                                <th style={th('center', '80px')}>SCORE</th>
                                <th style={th('center', '90px')}>TIME</th>
                                {ratingsCalculated && <th style={th('center', '80px')}>Δ RATING</th>}
                                {contest.problems.map((_: any, i: number) => (
                                    <th key={i} style={th('center', '72px')}>{problemLabels[i]}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {processedStandings.map((row: any, i: number) => {
                                const rank = i + 1;
                                const rankColor = rank === 1 ? '#b87a28' : rank === 2 ? '#7a90a8' : rank === 3 ? '#a06848' : 'var(--ink4)';
                                const ratingDeltaKey = isTeamContest ? null : (row.userId ?? row.user?.id ?? null);
                                const ratingDelta = ratingDeltaKey ? ratingDeltaMap[ratingDeltaKey] : undefined;

                                return (
                                    <tr key={row.key} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                        <td style={td('left')}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', fontWeight: 600, color: rankColor }}>{rank}</span>
                                        </td>
                                        <td style={td('left')}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div className="avatar avatar-sm" style={{ background: rank <= 3 ? 'rgba(184,133,58,0.12)' : 'rgba(107,148,120,0.10)', flexShrink: 0 }}>
                                                    {(row.user.username as string).slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Link href={`/user/${row.user.username}`} className="lb-name" style={{ textDecoration: 'none' }}>
                                                            {row.user.username}
                                                        </Link>
                                                        {row.isVirtual && (
                                                            <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(120,80,200,0.1)', color: '#9b78e8', fontFamily: 'var(--ff-mono)', fontWeight: 700, letterSpacing: '0.05em' }}>VIRTUAL</span>
                                                        )}
                                                    </div>
                                                    <div className="lb-sub-info">{row.user.rating} rating</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={td('center')}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '15px', fontWeight: 700, color: row.solvedCount > 0 ? 'var(--ink)' : 'var(--ink5)' }}>{row.solvedCount}</span>
                                        </td>
                                        <td style={td('center')}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', fontWeight: 600, color: row.totalScore > 0 ? 'var(--sage)' : 'var(--ink5)' }}>{row.totalScore > 0 ? row.totalScore : '-'}</span>
                                        </td>
                                        <td style={td('center')}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: row.solvedCount > 0 ? 'var(--ink3)' : 'var(--ink5)', whiteSpace: 'nowrap' }}>{row.solvedCount > 0 ? formatMins(row.totalTime) : '-'}</span>
                                        </td>
                                        {ratingsCalculated && (
                                            <td style={td('center')}>
                                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', fontWeight: 700, color: (ratingDelta ?? 0) > 0 ? 'var(--sage)' : (ratingDelta ?? 0) < 0 ? 'var(--rose)' : 'var(--ink5)' }}>
                                                    {ratingDelta === undefined ? '-' : `${ratingDelta > 0 ? '+' : ''}${ratingDelta}`}
                                                </span>
                                            </td>
                                        )}
                                        {contest.problems.map((p: any) => {
                                            const ps = row.problems[p.id];
                                            const isFirstSolve = ps?.solved && firstSolveMap[p.id] === row.key;
                                            if (!ps) return <td key={p.id} style={td('center')} />;
                                            const waCount = Math.round(ps.waPenalty / 5);
                                            return (
                                                <td key={p.id} style={td('center')}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                                        <div style={{
                                                            width: '32px', height: '32px', borderRadius: '50%',
                                                            background: ps.solved ? (isFirstSolve ? '#b87a28' : 'var(--sage)') : 'rgba(184,96,78,0.12)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontFamily: 'var(--ff-mono)', fontSize: '12px', fontWeight: 700, color: ps.solved ? '#fff' : 'var(--rose)',
                                                            border: ps.solved ? 'none' : '1.5px solid var(--rose)'
                                                        }}>
                                                            {ps.solved ? (waCount > 0 ? `+${waCount}` : '✓') : (waCount > 0 ? waCount : '-')}
                                                        </div>
                                                        {ps.solved && ps.solveTime && (
                                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', color: isFirstSolve ? '#b87a28' : 'var(--ink4)', whiteSpace: 'nowrap' }}>
                                                                {formatMins(elapsedMinsFromStart(ps.solveTime, row.startTime))}
                                                            </span>
                                                        )}
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
        padding: '9px 12px', textAlign: align, fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.14em',
        color: 'var(--ink5)', textTransform: 'uppercase', fontWeight: 500, whiteSpace: 'nowrap',
        ...(width ? { width, minWidth: width } : {}),
    };
}

function td(align: 'left' | 'center' | 'right'): React.CSSProperties {
    return { padding: '10px 12px', textAlign: align, verticalAlign: 'middle' };
}
