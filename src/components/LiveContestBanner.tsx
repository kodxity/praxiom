'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface LiveContest {
    id: string;
    title: string;
    endTime: string;
    personalEndTime: string;
}

function useCountdown(endTime: string | null) {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!endTime) return;

        function tick() {
            const diff = new Date(endTime!).getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft('__done__');
                return;
            }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            if (h > 0) {
                setTimeLeft(`${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`);
            } else {
                setTimeLeft(`${m}m ${String(s).padStart(2, '0')}s`);
            }
        }

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endTime]);

    return timeLeft;
}

export function LiveContestBanner() {
    const { status } = useSession();
    const [contest, setContest] = useState<LiveContest | null>(null);
    const [visible, setVisible] = useState(true);
    const timeLeft = useCountdown(contest?.personalEndTime ?? contest?.endTime ?? null);

    // Animate out ONLY if it expires while we're watching (timeLeft started as a real value)
    // If already expired on load, the poll handler discards it immediately — no animation needed
    useEffect(() => {
        if (timeLeft === '__done__') {
            setVisible(false);
            const t = setTimeout(() => setContest(null), 500);
            return () => clearTimeout(t);
        }
    }, [timeLeft]);

    useEffect(() => {
        if (status !== 'authenticated') return;

        function poll() {
            fetch('/api/user/live-contests')
                .then(r => r.json())
                .then(d => {
                    const c = d.contest ?? null;
                    if (c) {
                        const target = c.personalEndTime ?? c.endTime;
                        // Already expired → don't render at all
                        if (target && new Date(target).getTime() <= Date.now()) return;
                    }
                    setContest(c);
                })
                .catch(() => {});
        }

        poll();
        const id = setInterval(poll, 12000);
        return () => clearInterval(id);
    }, [status]);

    if (!contest) return null;

    return (
        <div style={{
            background: 'var(--theme-nav-bg, rgba(238,234,227,0.88))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(107,148,120,0.3)',
            padding: '0 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: visible ? '40px' : '0px',
            opacity: visible ? 1 : 0,
            overflow: 'hidden',
            position: 'sticky',
            top: '64px',
            zIndex: 49,
            transition: 'height 0.4s ease, opacity 0.4s ease, background 0.4s ease',
        }}>
            {/* Left: live indicator + contest name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
                {/* Pulsing dot */}
                <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                    <span className="live-ping" />
                    <span style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: 'var(--sage)', display: 'block',
                    }} />
                </span>

                <span style={{
                    fontFamily: 'var(--ff-mono)', fontSize: '9px',
                    letterSpacing: '0.16em', color: 'var(--sage)',
                    textTransform: 'uppercase', flexShrink: 0, fontWeight: 600,
                }}>
                    Live
                </span>

                <span style={{
                    width: '1px', height: '14px',
                    background: 'rgba(107,148,120,0.3)', flexShrink: 0,
                }} />

                <span style={{
                    fontFamily: 'var(--ff-ui)', fontSize: '13px',
                    fontWeight: 500, color: 'var(--ink)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                    {contest.title}
                </span>
            </div>

            {/* Right: timer + open button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                {timeLeft && timeLeft !== '__done__' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{
                            fontFamily: 'var(--ff-mono)', fontSize: '9px',
                            color: 'var(--ink5)', letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                        }}>Ends in</span>
                        <span style={{
                            fontFamily: 'var(--ff-mono)', fontSize: '12px',
                            fontWeight: 700, color: 'var(--ink)',
                            letterSpacing: '0.03em',
                        }}>
                            {timeLeft}
                        </span>
                    </div>
                )}

                <Link
                    href={`/contests/${contest.id}`}
                    style={{
                        fontFamily: 'var(--ff-ui)', fontSize: '11px', fontWeight: 600,
                        padding: '4px 11px', borderRadius: 'var(--r)',
                        background: 'var(--sage-bg)',
                        border: '1px solid var(--sage-border)',
                        color: 'var(--sage)',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        display: 'flex', alignItems: 'center', gap: '4px',
                    }}
                >
                    Open Contest
                    <span style={{ opacity: 0.7 }}>→</span>
                </Link>
            </div>
        </div>
    );
}
