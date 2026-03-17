import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function th(align: 'left' | 'center' | 'right', width?: string): React.CSSProperties {
    return {
        padding: '9px 14px',
        textAlign: align,
        fontFamily: 'var(--ff-mono)',
        fontSize: '9px',
        letterSpacing: '0.14em',
        color: 'var(--ink5)',
        textTransform: 'uppercase',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        ...(width ? { width, minWidth: width } : {}),
    };
}

function td(align: 'left' | 'center' | 'right'): React.CSSProperties {
    return {
        padding: '10px 14px',
        textAlign: align,
        verticalAlign: 'middle',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
    };
}

export default async function ContestSubmissionsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    const contest = await prisma.contest.findUnique({
        where: { id: params.id },
        include: {
            problems: { orderBy: { id: 'asc' } },
            submissions: {
                where: {
                    userId: session?.user?.id ?? '___no_user___',
                },
                include: { user: { select: { id: true, username: true } }, problem: { select: { id: true, title: true } } },
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!contest) notFound();

    // All submissions (no window filter - all-time)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowSubs = contest.submissions as any[];

    // Viewer's solved problem IDs (controls answer visibility)
    const viewerSolvedIds = new Set<string>();
    if (session?.user?.id) {
        const viewerSubs = await prisma.submission.findMany({
            where: {
                userId: session.user.id,
                contestId: params.id,
                isCorrect: true,
                isUpsolve: false,
            },
            select: { problemId: true },
        });
        viewerSubs.forEach(s => viewerSolvedIds.add(s.problemId));
    }

    // Problem label map
    const problemLabels = new Map<string, string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (contest.problems as any[]).forEach((p, i) => {
        problemLabels.set(p.id, String.fromCharCode(65 + i));
    });

    const formatTime = (date: Date) =>
        date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const now = new Date();
    const isLive = now >= contest.startTime && now <= contest.endTime;

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
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            <div className="fade-in" style={{ marginBottom: '36px' }}>
                <Link href={`/contests/${contest.id}`} className="btn btn-ghost btn-sm" style={{ marginBottom: '20px' }}>
                    ← Back to Contest
                </Link>
                <p className="sec-label" style={{ marginTop: '20px' }}>CONTEST SUBMISSIONS</p>
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
                    <Link href={`/contests/${contest.id}/standings`} style={tabLink}>
                        Standings
                    </Link>
                    <span style={tabActive}>Submissions</span>
                    <Link href={`/contests/${contest.id}/all-submissions`} style={tabLink}>All Submissions</Link>
                </div>
            </div>

            {windowSubs.length === 0 ? (
                <div className="g fade-in-d">
                    <div className="empty">
                        <div className="empty-title">No submissions yet</div>
                        <div className="empty-body">Submissions will appear here once the contest begins.</div>
                    </div>
                </div>
            ) : (
                <div className="g fade-in-d" style={{ overflow: 'auto', padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.025)' }}>
                                <th style={th('left')}>PROBLEM</th>
                                <th style={th('left', '160px')}>USER</th>
                                <th style={th('center', '120px')}>DATE</th>
                                <th style={th('left', '140px')}>ANSWER</th>
                                <th style={th('center', '72px')}>RESULT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {windowSubs.map((sub: any, i: number) => {
                                const label = problemLabels.get(sub.problemId) ?? '?';
                                const canSeeAnswer = sub.user.id === session?.user?.id || viewerSolvedIds.has(sub.problemId);
                                return (
                                    <tr key={sub.id} style={{ animation: `fade-in 0.3s ${i * 0.015}s both` }}>
                                        {/* Problem */}
                                        <td style={td('left')}>
                                            <Link
                                                href={`/contests/${contest.id}/problems/${sub.problemId}`}
                                                style={{ textDecoration: 'none', color: 'var(--ink)' }}
                                            >
                                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)', marginRight: '6px' }}>{label}.</span>
                                                <span style={{ fontFamily: 'var(--ff-body)', fontSize: '13px' }}>{sub.problem.title}</span>
                                            </Link>
                                        </td>

                                        {/* User */}
                                        <td style={td('left')}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="avatar avatar-sm" style={{ flexShrink: 0, background: 'rgba(107,148,120,0.10)' }}>
                                                    {(sub.user.username as string).slice(0, 2).toUpperCase()}
                                                </div>
                                                <Link href={`/user/${sub.user.username}`} style={{ fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 500, color: 'var(--ink)', textDecoration: 'none' }}>
                                                    {sub.user.username}
                                                </Link>
                                            </div>
                                        </td>

                                        {/* Time */}
                                        <td style={td('center')}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink4)', whiteSpace: 'nowrap' }}>
                                                {formatTime(sub.createdAt)}
                                            </span>
                                        </td>

                                        {/* Answer */}
                                        <td style={td('left')}>
                                            {canSeeAnswer ? (
                                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: sub.isCorrect ? 'var(--sage)' : 'var(--ink3)' }}>
                                                    {sub.answer}
                                                </span>
                                            ) : (
                                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)' }}>
                                                    - solve to reveal
                                                </span>
                                            )}
                                        </td>

                                        {/* Result */}
                                        <td style={td('center')}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                width: '24px', height: '24px', borderRadius: '50%',
                                                background: sub.isCorrect ? 'var(--sage-bg)' : 'rgba(184,96,78,0.1)',
                                                border: `1px solid ${sub.isCorrect ? 'var(--sage-border)' : 'rgba(184,96,78,0.25)'}`,
                                                fontFamily: 'var(--ff-mono)', fontSize: '11px', fontWeight: 700,
                                                color: sub.isCorrect ? 'var(--sage)' : 'var(--rose)',
                                            }}>
                                                {sub.isCorrect ? '✓' : '✗'}
                                            </span>
                                        </td>
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
