'use client';
import { useState } from 'react';
import Link from 'next/link';

type User  = { id: string; username: string; rating: number; isAdmin: boolean; isTeacher: boolean; school: { shortName: string; district: string } | null; groupMemberships: { group: { id: string; name: string; school: { shortName: string; district: string } | null } }[]; _count: { ratingHistory: number } };

function getRankLabel(rating: number) {
    if (rating >= 2400) return { label: 'Grandmaster', cls: 'rank-badge rank-grandmaster' };
    if (rating >= 2000) return { label: 'Master',      cls: 'rank-badge rank-master' };
    if (rating >= 1600) return { label: 'Expert',      cls: 'rank-badge rank-expert' };
    if (rating >= 1200) return { label: 'Pupil',       cls: 'rank-badge rank-pupil' };
    return                     { label: 'Newbie',      cls: 'rank-badge rank-newbie' };
}

function getRoleBadge(user: User) {
    if (user.isAdmin) return { label: 'Admin', cls: 'rank-badge rank-archon' };
    if (user.isTeacher) return { label: 'Teacher', cls: 'rank-badge rank-legend' };
    return { label: 'Student', cls: 'rank-badge rank-initiate' };
}

function getRatingColor(rating: number) {
    if (rating >= 2400) return 'var(--rose)';
    if (rating >= 2000) return 'var(--amber)';
    if (rating >= 1600) return 'var(--slate)';
    if (rating >= 1200) return 'var(--sage)';
    return 'var(--ink4)';
}

export function LeaderboardClient({ users }: { users: User[] }) {

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
                    Ratings update after each contest. Climb from Newbie to Grandmaster.
                </p>
            </div>

            {/* Leaderboard card */}
            <div className="g lb-card fade-in-d">

                {/* Head */}
                <div className="lb-head">
                    <div style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', color: 'var(--ink)' }}>All Time Rankings</div>
                </div>

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
                                    {(() => {
                                        const role = getRoleBadge(user);
                                        return <span className={role.cls} style={{ padding: '2px 8px', fontSize: '9px', opacity: 0.85 }}>{role.label}</span>;
                                    })()}
                                    <span>{user._count.ratingHistory} contest{user._count.ratingHistory !== 1 ? 's' : ''}</span>
                                </div>
                            </div>

                            {/* Pills - vertically centered by lb-row's align-items:center */}
                            {(() => {
                                const primaryGroup = user.groupMemberships?.[0]?.group ?? null;
                                const displaySchool = user.school ?? primaryGroup?.school ?? null;
                                return displaySchool ? (
                                    <div className="lb-pills-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink3)', background: 'rgba(0,0,0,0.05)', padding: '2px 9px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
                                            {displaySchool.shortName}
                                        </span>
                                    </div>
                                ) : null;
                            })()}
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
