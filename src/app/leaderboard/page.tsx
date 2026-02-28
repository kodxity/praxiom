import { prisma } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function getRankLabel(rating: number): { label: string; cls: string } {
    if (rating >= 2400) return { label: 'Archon',   cls: 'rank-badge rank-archon' };
    if (rating >= 2000) return { label: 'Legend',   cls: 'rank-badge rank-legend' };
    if (rating >= 1600) return { label: 'Seeker',   cls: 'rank-badge rank-seeker' };
    return                     { label: 'Initiate', cls: 'rank-badge rank-initiate' };
}

function getRatingColor(rating: number): string {
    if (rating >= 2400) return 'var(--amber)';
    if (rating >= 2000) return 'var(--violet)';
    if (rating >= 1600) return 'var(--slate)';
    if (rating >= 1400) return 'var(--sage)';
    return 'var(--ink3)';
}

export default async function LeaderboardPage() {
    let users: any[] = [];
    try {
        users = await prisma.user.findMany({
            where: { isApproved: true },
            orderBy: { rating: 'desc' },
            select: {
                id: true,
                username: true,
                rating: true,
                _count: { select: { ratingHistory: true } },
            },
        });
    } catch {
        // DB unavailable in local frontend dev
    }

    return (
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            {/* Header */}
            <div className="fade-in" style={{ marginBottom: '36px' }}>
                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.25em', color: 'var(--sage)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '28px', height: '1px', background: 'var(--sage)', opacity: 0.6, display: 'inline-block' }} />
                    GLOBAL RANKINGS
                </p>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: '10px' }}>
                    The <em style={{ fontStyle: 'italic', color: 'var(--sage)' }}>Conclave</em>
                </h1>
                <p style={{ fontSize: '15px', fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.6 }}>
                    Ratings update after each contest. Climb from Initiate to Archon.
                </p>
            </div>

            {/* Leaderboard card */}
            <div className="g lb-card fade-in-d">

                {/* Head */}
                <div className="lb-head">
                    <div style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', color: 'var(--ink)' }}>All Time</div>
                    <div className="lb-filters">
                        <button className="lb-filter active">Solvers</button>
                        <button className="lb-filter">This Month</button>
                    </div>
                </div>

                {users.length === 0 && (
                    <div className="empty">
                        <div className="empty-title">No solvers yet</div>
                        <div className="empty-body">Be the first to compete and claim the top spot.</div>
                        <Link href="/contests" className="btn btn-ghost btn-sm" style={{ marginTop: '4px' }}>Browse Contests</Link>
                    </div>
                )}

                {users.map((user: any, i: number) => {
                    const rank = getRankLabel(user.rating);
                    const isGold   = i === 0;
                    const isSilver = i === 1;
                    const isBronze = i === 2;
                    const posColor = isGold ? '#b87a28' : isSilver ? '#7a90a8' : isBronze ? '#a06848' : undefined;

                    return (
                        <div
                            key={user.id}
                            className="lb-row fade-in"
                            style={{
                                animationDelay: `${0.05 + i * 0.035}s`,
                                background: i < 3 ? (isGold ? 'rgba(184,133,58,0.04)' : isSilver ? 'rgba(88,120,160,0.03)' : 'rgba(184,96,78,0.03)') : undefined,
                            }}
                        >
                            {/* Position */}
                            <span className="lb-rank" style={posColor ? { color: posColor, fontSize: '15px', fontWeight: 700 } : {}}>
                                {i + 1}
                            </span>

                            {/* Avatar */}
                            <div className="avatar avatar-sm">{user.username[0].toUpperCase()}</div>

                            {/* Name + rank */}
                            <div style={{ flex: 1 }}>
                                <Link
                                    href={`/user/${user.username}`}
                                    className="lb-name"
                                    style={{ textDecoration: 'none', color: getRatingColor(user.rating), display: 'block' }}
                                >
                                    {user.username}
                                </Link>
                                <div className="lb-sub-info">
                                    <span className={rank.cls} style={{ padding: '2px 8px', fontSize: '9px' }}>{rank.label}</span>
                                    <span style={{ marginLeft: '6px' }}>{user._count.ratingHistory} contest{user._count.ratingHistory !== 1 ? 's' : ''}</span>
                                </div>
                            </div>

                            {/* Rating */}
                            <span className="lb-score" style={{ color: getRatingColor(user.rating), fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                                {user.rating}
                            </span>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
