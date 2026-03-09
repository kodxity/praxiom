'use client';
import { useState } from 'react';
import Link from 'next/link';

type User  = { id: string; username: string; rating: number; school: { shortName: string; district: string } | null; group: { id: string; name: string; school: { shortName: string; district: string } | null } | null; _count: { ratingHistory: number } };
type Group = { id: string; name: string; school: { shortName: string; district: string } | null; teacher: { username: string }; memberCount: number; avgRating: number | null; topRating: number | null };

function getRankLabel(rating: number) {
    if (rating >= 2400) return { label: 'Archon',   cls: 'rank-badge rank-archon' };
    if (rating >= 2000) return { label: 'Legend',   cls: 'rank-badge rank-legend' };
    if (rating >= 1600) return { label: 'Seeker',   cls: 'rank-badge rank-seeker' };
    return                     { label: 'Initiate', cls: 'rank-badge rank-initiate' };
}

function getRatingColor(rating: number) {
    if (rating >= 2400) return 'var(--amber)';
    if (rating >= 2000) return 'var(--violet)';
    if (rating >= 1600) return 'var(--slate)';
    if (rating >= 1400) return 'var(--sage)';
    return 'var(--ink3)';
}

export function LeaderboardClient({ users, groups }: { users: User[]; groups: Group[] }) {
    const [tab, setTab] = useState<'solvers' | 'groups'>('solvers');

    const filterStyle = (active: boolean): React.CSSProperties => ({
        fontFamily: 'var(--ff-ui)',
        fontSize: '13px',
        fontWeight: active ? 600 : 400,
        padding: '6px 14px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        background: active ? 'white' : 'transparent',
        color: active ? 'var(--ink)' : 'var(--ink4)',
        boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.15s',
    });

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
                    <div className="lb-filters" style={{ padding: '3px', background: 'rgba(0,0,0,0.04)', borderRadius: '10px' }}>
                        <button className="lb-filter" style={filterStyle(tab === 'solvers')} onClick={() => setTab('solvers')}>Solvers</button>
                        <button className="lb-filter" style={filterStyle(tab === 'groups')} onClick={() => setTab('groups')}>Groups</button>
                    </div>
                </div>

                {/* Solvers tab */}
                {tab === 'solvers' && (
                    <>
                        {users.length === 0 && (
                            <div className="empty">
                                <div className="empty-title">No solvers yet</div>
                                <div className="empty-body">Be the first to compete and claim the top spot.</div>
                                <Link href="/contests" className="btn btn-ghost btn-sm" style={{ marginTop: '4px' }}>Browse Contests</Link>
                            </div>
                        )}

                        {users.map((user, i) => {
                            const rank = getRankLabel(user.rating);
                            const isGold = i === 0, isSilver = i === 1, isBronze = i === 2;
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
                                    <span className="lb-rank" style={posColor ? { color: posColor, fontSize: '15px', fontWeight: 700 } : {}}>
                                        {i + 1}
                                    </span>
                                    <div className="avatar avatar-sm">{user.username[0].toUpperCase()}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Link href={`/user/${user.username}`} className="lb-name" style={{ textDecoration: 'none', color: getRatingColor(user.rating) }}>
                                            {user.username}
                                        </Link>
                                        <div className="lb-sub-info" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '3px' }}>
                                            <span className={rank.cls} style={{ padding: '2px 8px', fontSize: '9px' }}>{rank.label}</span>
                                            <span>{user._count.ratingHistory} contest{user._count.ratingHistory !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>

                                    {/* Pills - vertically centered by lb-row's align-items:center */}
                                    {(() => {
                                        const displaySchool = user.school ?? user.group?.school ?? null;
                                        return (user.group || displaySchool) ? (
                                            <div className="lb-pills-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                                {user.group && (
                                                    <Link href={`/groups/${user.group.id}`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--sage)', background: 'rgba(107,148,120,0.1)', padding: '2px 9px', borderRadius: '99px', textDecoration: 'none', border: '1px solid rgba(107,148,120,0.25)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                                                        {user.group.name}
                                                    </Link>
                                                )}
                                                {displaySchool && (
                                                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink3)', background: 'rgba(0,0,0,0.05)', padding: '2px 9px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
                                                        {displaySchool.shortName}
                                                    </span>
                                                )}
                                            </div>
                                        ) : null;
                                    })()}
                                    <span className="lb-score" style={{ color: getRatingColor(user.rating), fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                                        {user.rating}
                                    </span>
                                </div>
                            );
                        })}
                    </>
                )}

                {/* Groups tab */}
                {tab === 'groups' && (
                    <>
                        {groups.length === 0 && (
                            <div className="empty">
                                <div className="empty-title">No groups yet</div>
                                <div className="empty-body">Groups appear once a teacher is approved and students join.</div>
                            </div>
                        )}

                        {groups.map((g, i) => {
                            const isGold = i === 0, isSilver = i === 1, isBronze = i === 2;
                            const posColor = isGold ? '#b87a28' : isSilver ? '#7a90a8' : isBronze ? '#a06848' : undefined;

                            return (
                                <div
                                    key={g.id}
                                    className="lb-row fade-in"
                                    style={{
                                        animationDelay: `${0.05 + i * 0.035}s`,
                                        background: i < 3 ? (isGold ? 'rgba(184,133,58,0.04)' : isSilver ? 'rgba(88,120,160,0.03)' : 'rgba(184,96,78,0.03)') : undefined,
                                    }}
                                >
                                    <span className="lb-rank" style={posColor ? { color: posColor, fontSize: '15px', fontWeight: 700 } : {}}>
                                        {i + 1}
                                    </span>

                                    {/* Group avatar */}
                                    <div className="avatar avatar-sm" style={{ background: 'rgba(107,148,120,0.12)', color: 'var(--sage)' }}>
                                        {g.name[0].toUpperCase()}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Link href={`/groups/${g.id}`} className="lb-name" style={{ textDecoration: 'none', color: 'var(--ink)' }}>
                                            {g.name}
                                        </Link>
                                        <div className="lb-sub-info" style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>
                                                {g.memberCount} member{g.memberCount !== 1 ? 's' : ''}
                                            </span>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', opacity: 0.5 }}>·</span>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>by {g.teacher.username}</span>
                                        </div>
                                    </div>

                                    {/* School pill - vertically centered */}
                                    {g.school && (
                                        <div className="lb-pills-col">
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink3)', background: 'rgba(0,0,0,0.05)', padding: '2px 9px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
                                                {g.school.shortName}
                                            </span>
                                        </div>
                                    )}

                                    <div style={{ textAlign: 'right' }}>
                                        {g.avgRating != null ? (
                                            <>
                                                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '15px', fontWeight: 700, color: getRatingColor(g.avgRating), letterSpacing: '-0.02em' }}>
                                                    {g.avgRating}
                                                </div>
                                                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>avg</div>
                                            </>
                                        ) : (
                                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)', opacity: 0.6 }}>no members</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

        </div>
    );
}
