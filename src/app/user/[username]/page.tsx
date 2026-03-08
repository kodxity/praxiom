import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { RatingGraph } from './RatingGraph';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserSettings } from './UserSettings';
import Link from 'next/link';

export default async function UserProfile(props: { params: Promise<{ username: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    let user: any = null;
    let submissions: any[] = [];
    let allSubmissions: any[] = [];

    try {
        user = await prisma.user.findUnique({
            where: { username: params.username },
            include: {
                ratingHistory: { orderBy: { createdAt: 'asc' } },
                school: { select: { name: true, shortName: true, district: true } },
                group: { select: { id: true, name: true } },
                taughtGroup: { select: { id: true, name: true } },
            }
        });
    } catch {
        // DB unavailable in local frontend dev
    }

    if (!user) notFound();

    const isOwnProfile = session?.user?.username === user.username;
    const isAdmin = session?.user?.isAdmin === true;
    const canSeeSubmissions = isOwnProfile || isAdmin;

    // Heatmap only needs last 112 days
    const heatmapCutoff = new Date();
    heatmapCutoff.setDate(heatmapCutoff.getDate() - 112);

    // Fetch the viewer's own solved problem IDs so we can reveal answers they already know
    let viewerSolvedProblemIds = new Set<string>();
    if (session?.user?.id && !canSeeSubmissions) {
        try {
            const viewerSolves = await prisma.submission.findMany({
                where: { userId: session.user.id, isCorrect: true },
                select: { problemId: true },
            });
            viewerSolvedProblemIds = new Set(viewerSolves.map(s => s.problemId));
        } catch { /* ignore */ }
    }

    let totalSolved = 0;
    let totalXP = 0;
    try {
        const [detailedSubs, heatmapSubs, solvedCount, xpSubs] = await Promise.all([
            // Always fetch submissions - answer is conditionally hidden in UI
            prisma.submission.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: { problem: { select: { title: true, points: true } } },
            }),
            // Heatmap: only last 112 days, dates only
            prisma.submission.findMany({
                where: { userId: user.id, createdAt: { gte: heatmapCutoff } },
                select: { createdAt: true },
            }),
            // Total solved count (all-time, fast COUNT query)
            prisma.submission.count({ where: { userId: user.id, isCorrect: true } }),
            // XP: sum of points from all correct submissions
            prisma.submission.findMany({
                where: { userId: user.id, isCorrect: true },
                select: { problem: { select: { points: true } } },
            }),
        ]);
        submissions = detailedSubs;
        allSubmissions = heatmapSubs;
        totalSolved = solvedCount;
        totalXP = xpSubs.reduce((s: number, sub: any) => s + (sub.problem?.points ?? 0), 0);
    } catch { /* DB unavailable */ }

    const graphData = user.ratingHistory.map((h: any) => ({
        date: h.createdAt.toLocaleDateString(),
        rating: h.newRating,
        contestId: h.contestId
    }));
    if (graphData.length === 0 || graphData[0].rating !== 1200) {
        graphData.unshift({ date: 'Start', rating: 1200, contestId: 'init' });
    }

    const maxRating = Math.max(1200, ...user.ratingHistory.map((r: any) => r.newRating));
    const rank = getRankLabel(user.rating);
    const initials = user.username[0].toUpperCase();
    // Heatmap: 16 weeks × 7 days = 112 cells, newest day = today
    const today = new Date(); today.setHours(23, 59, 59, 999);
    const DAYS = 112;
    const submissionMap = new Map<string, number>();
    for (const s of allSubmissions) {
        const key = new Date(s.createdAt).toISOString().slice(0, 10);
        submissionMap.set(key, (submissionMap.get(key) ?? 0) + 1);
    }
    const heatmapCells: { date: string; count: number }[] = [];
    for (let i = DAYS - 1; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        heatmapCells.push({ date: key, count: submissionMap.get(key) ?? 0 });
    }
    const maxCount = Math.max(1, ...heatmapCells.map(c => c.count));
    function heatClass(count: number) {
        if (count === 0) return '';
        const lvl = Math.ceil((count / maxCount) * 4);
        return `hm-${lvl}`;
    }

    return (
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            {/* ── Profile Hero ── */}
            <div className="g profile-hero fade-in" style={{ marginBottom: '20px' }}>
                <div className="profile-top">
                    {/* Avatar */}
                    <div className="avatar">{initials}</div>
                    <div style={{ flex: 1 }}>
                        <div className="profile-name">{user.username}</div>
                        <div className="profile-handle">@{user.username} · joined {new Date(user.createdAt ?? Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                            <span className={rank.cls}>⬡ {rank.label}</span>
                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', fontWeight: 600, color: getRatingColor(user.rating) }}>{user.rating}</span>
                        </div>
                        {/* Org badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                            {user.school && (
                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', padding: '2px 9px', borderRadius: '99px', background: 'rgba(88,120,160,0.1)', border: '1px solid rgba(88,120,160,0.2)', color: 'var(--slate, #5878a0)', letterSpacing: '0.04em' }}>
                                    {user.school.shortName} · {user.school.district}
                                </span>
                            )}
                            {(user.group || user.taughtGroup) && (() => {
                                const g = user.group ?? user.taughtGroup;
                                return (
                                    <a href={`/groups/${g.id}`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', padding: '2px 9px', borderRadius: '99px', background: 'rgba(107,148,120,0.1)', border: '1px solid rgba(107,148,120,0.2)', color: 'var(--sage)', letterSpacing: '0.04em', textDecoration: 'none' }}>
                                        {user.taughtGroup ? '📚 ' : ''}
                                        {g.name}
                                    </a>
                                );
                            })()}
                        </div>
                    </div>
                    {isOwnProfile && (
                        <div style={{ flexShrink: 0 }}>
                            <UserSettings user={user} />
                        </div>
                    )}
                </div>

                {user.description && (
                    <div className="profile-bio" style={{ marginBottom: '24px', maxWidth: '560px' }}>
                        {user.description}
                    </div>
                )}

                {/* Stat grid */}
                <div className="stat-grid">
                    <div className="g stat-block">
                        <div className="stat-val">{totalSolved}</div>
                        <div className="stat-label">Problems Solved</div>
                    </div>
                    <div className="g stat-block">
                        <div className="stat-val">{user.rating}</div>
                        <div className="stat-label">Rating</div>
                    </div>
                    <div className="g stat-block">
                        <div className="stat-val">{maxRating}</div>
                        <div className="stat-label">Peak Rating</div>
                    </div>
                    <div className="g stat-block">
                        <div className="stat-val">{user.ratingHistory.length}</div>
                        <div className="stat-label">Contests</div>
                    </div>
                </div>
            </div>

            <div className="profile-2col">

                {/* ── Left column: graph + heatmap + submissions ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Rating graph */}
                    <div className="g fade-in-d" style={{ padding: '24px 28px' }}>
                        <div style={{ fontFamily: 'var(--ff-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            Rating History
                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>
                                {user.ratingHistory.length} contest{user.ratingHistory.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div style={{ height: '220px', width: '100%' }}>
                            <RatingGraph data={graphData} />
                        </div>
                    </div>

                    {/* Activity heatmap */}
                    <div className="g fade-in-d" style={{ padding: '20px 24px' }}>
                        <div style={{ fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '14px' }}>
                            Activity - last 16 weeks
                        </div>
                        <div className="heatmap-scroll">
                        <div className="heatmap">
                            {heatmapCells.map((cell) => (
                                <div
                                    key={cell.date}
                                    className={`heatmap-cell ${heatClass(cell.count)}`}
                                    title={`${cell.date}: ${cell.count} submission${cell.count !== 1 ? 's' : ''}`}
                                />
                            ))}
                        </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', color: 'var(--ink5)' }}>Less</span>
                            {['', 'hm-1', 'hm-2', 'hm-3', 'hm-4'].map((c, i) => (
                                <div key={i} className={`heatmap-cell ${c}`} />
                            ))}
                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', color: 'var(--ink5)' }}>More</span>
                        </div>
                    </div>

                    {/* Recent Submissions */}
                    {submissions.length > 0 && (
                        <div className="g fade-in-d2" style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '16px 24px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)', fontFamily: 'var(--ff-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>
                                Recent Submissions
                            </div>
                            {submissions.map((sub: any) => (
                                <div key={sub.id} className="sub-row">
                                    <span className={`verdict-chip ${sub.isCorrect ? 'v-correct' : 'v-wrong'}`}>
                                        {sub.isCorrect ? '✓ Correct' : '✕ Wrong'}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontFamily: 'var(--ff-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>
                                                {sub.problem?.title ?? 'Problem'}
                                            </span>
                                            {sub.isUpsolve && (
                                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.1em', padding: '1px 6px', borderRadius: '99px', background: 'var(--amber-bg, rgba(180,140,60,0.1))', border: '1px solid var(--amber-border, rgba(180,140,60,0.25))', color: 'var(--amber)', whiteSpace: 'nowrap' }}>
                                                    UPSOLVE
                                                </span>
                                            )}
                                        </div>
                                        {(canSeeSubmissions || viewerSolvedProblemIds.has(sub.problemId)) && (
                                        <div style={{ fontSize: '12px', color: 'var(--ink5)', fontFamily: 'var(--ff-mono)' }}>
                                            Answer: {sub.answer}
                                        </div>
                                        )}
                                    </div>
                                    {sub.isCorrect && sub.problem?.points && !sub.isUpsolve ? (
                                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--amber)', whiteSpace: 'nowrap' }}>
                                            +{sub.problem.points} XP
                                        </span>
                                    ) : (
                                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)' }}>-</span>
                                    )}
                                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', whiteSpace: 'nowrap' }}>
                                        {timeAgo(sub.createdAt)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Right column: rank info ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Level card */}
                    <div className="g fade-in-d" style={{ padding: '22px 24px' }}>
                        {(() => {
                            const level = 1 + Math.floor(Math.sqrt(totalXP / 100));
                            const currentThreshold = (level - 1) ** 2 * 100;
                            const nextThreshold    = level ** 2 * 100;
                            const progress = nextThreshold > currentThreshold
                                ? (totalXP - currentThreshold) / (nextThreshold - currentThreshold)
                                : 1;
                            return (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div>
                                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '4px' }}>Level</div>
                                            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '36px', fontWeight: 400, color: 'var(--ink)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                                                {level}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '4px' }}>Total XP</div>
                                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '18px', fontWeight: 600, color: 'var(--amber)' }}>
                                                {totalXP.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div style={{ marginTop: '6px', marginBottom: '8px' }}>
                                        <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${Math.min(100, progress * 100).toFixed(1)}%`, borderRadius: '99px', background: 'linear-gradient(90deg, var(--sage), var(--amber))', transition: 'width 0.5s ease' }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>
                                                {totalXP - currentThreshold} / {nextThreshold - currentThreshold} XP to Lv.{level + 1}
                                            </span>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>
                                                {Math.round(progress * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* Rank card */}
                    <div className="g fade-in-d" style={{ padding: '22px 24px' }}>
                        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '14px' }}>
                            Rank Tier
                        </div>
                        {RANK_TIERS.map((tier) => {
                            const isCurrentTier = user.rating >= tier.min && user.rating < tier.max;
                            return (
                                <div
                                    key={tier.name}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '8px 12px', borderRadius: '10px', marginBottom: '6px',
                                        background: isCurrentTier ? 'rgba(107,148,120,0.08)' : 'transparent',
                                        border: isCurrentTier ? '1px solid var(--sage-border)' : '1px solid transparent',
                                    }}
                                >
                                    <span className={`rank-badge ${tier.cls}`} style={{ padding: '3px 8px', fontSize: '10px' }}>{tier.name}</span>
                                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)' }}>
                                        {tier.min === 0 ? `< ${tier.max}` : tier.max === Infinity ? `${tier.min}+` : `${tier.min}–${tier.max}`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Contest history */}
                    {user.ratingHistory.length > 0 && (
                        <div className="g fade-in-d2" style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>
                                Contest History
                            </div>
                            {user.ratingHistory.slice(-6).reverse().map((h: any) => {
                                const delta = h.newRating - h.oldRating;
                                return (
                                    <div key={h.id} className="sub-row" style={{ padding: '10px 20px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink3)' }}>
                                                {new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', fontWeight: 600, color: delta >= 0 ? 'var(--sage)' : 'var(--rose)' }}>
                                            {delta >= 0 ? '+' : ''}{delta}
                                        </span>
                                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink3)', marginLeft: '4px' }}>
                                            {h.newRating}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

// ── Helpers ────────────────────────────────────────────────────

const RANK_TIERS = [
    { name: 'Initiate', cls: 'rank-initiate', min: 0,    max: 1400 },
    { name: 'Seeker',   cls: 'rank-seeker',   min: 1400, max: 2000 },
    { name: 'Legend',   cls: 'rank-legend',   min: 2000, max: 2400 },
    { name: 'Archon',   cls: 'rank-archon',   min: 2400, max: Infinity },
];

function getRankLabel(rating: number): { label: string; cls: string } {
    if (rating >= 2400) return { label: 'Archon',   cls: 'rank-badge rank-archon' };
    if (rating >= 2000) return { label: 'Legend',   cls: 'rank-badge rank-legend' };
    if (rating >= 1400) return { label: 'Seeker',   cls: 'rank-badge rank-seeker' };
    return                     { label: 'Initiate', cls: 'rank-badge rank-initiate' };
}

function getRatingColor(rating: number): string {
    if (rating >= 2400) return 'var(--amber)';
    if (rating >= 2000) return 'var(--violet)';
    if (rating >= 1400) return 'var(--slate)';
    return 'var(--ink3)';
}

function timeAgo(date: Date): string {
    const diff   = Date.now() - new Date(date).getTime();
    const secs   = Math.floor(diff / 1000);
    const mins   = Math.floor(secs  / 60);
    const hours  = Math.floor(mins  / 60);
    const days   = Math.floor(hours / 24);
    const weeks  = Math.floor(days  / 7);
    const months = Math.floor(days  / 30);
    const years  = Math.floor(days  / 365);
    if (secs   < 60)  return `${secs}s ago`;
    if (mins   < 60)  return `${mins}m ago`;
    if (hours  < 24)  return `${hours}h ago`;
    if (days   < 7)   return `${days}d ago`;
    if (weeks  < 5)   return `${weeks}w ago`;
    if (months < 12)  return `${months}mo ago`;
    return `${years}y ago`;
}

