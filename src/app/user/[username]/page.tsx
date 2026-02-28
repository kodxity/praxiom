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
            include: { ratingHistory: { orderBy: { createdAt: 'asc' } } }
        });
    } catch {
        // DB unavailable in local frontend dev
    }

    if (!user) notFound();

    try {
        [submissions, allSubmissions] = await Promise.all([
            // Recent detailed submissions (for the table)
            prisma.submission.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: { problem: { select: { title: true, points: true } } }
            }),
            // All submissions for heatmap (dates only)
            prisma.submission.findMany({
                where: { userId: user.id },
                select: { createdAt: true, isCorrect: true },
            }),
        ]);
    } catch { /* DB unavailable */ }

    const isOwnProfile = session?.user?.username === user.username;

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
    const totalSolved = allSubmissions.filter((s: any) => s.isCorrect).length;
    const totalXP = submissions.reduce((acc: number, s: any) => acc + (s.isCorrect ? (s.problem?.points ?? 0) : 0), 0);

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>

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
                        <div className="heatmap">
                            {heatmapCells.map((cell) => (
                                <div
                                    key={cell.date}
                                    className={`heatmap-cell ${heatClass(cell.count)}`}
                                    title={`${cell.date}: ${cell.count} submission${cell.count !== 1 ? 's' : ''}`}
                                />
                            ))}
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
                                        <div style={{ fontFamily: 'var(--ff-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>
                                            {sub.problem?.title ?? 'Problem'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--ink5)', fontFamily: 'var(--ff-mono)' }}>
                                            Answer: {sub.answer}
                                        </div>
                                    </div>
                                    {sub.isCorrect && sub.problem?.points ? (
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
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

