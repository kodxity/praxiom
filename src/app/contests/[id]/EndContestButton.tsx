'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function EndContestButton({ contestId }: { contestId: string }) {
    const [loading, setLoading]       = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [status, setStatus]         = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);
    const router = useRouter();

    async function handleEnd() {
        setConfirming(false);
        setLoading(true);
        setStatus(null);
        try {
            const endRes = await fetch(`/api/contests/${contestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endTime: new Date().toISOString() }),
            });
            if (!endRes.ok) {
                const body = await endRes.json().catch(() => ({}));
                setStatus({ type: 'error', message: 'Failed to end contest: ' + (body?.error || endRes.statusText) });
                return;
            }
            const ratingRes = await fetch(`/api/contests/${contestId}/calculate-ratings`, { method: 'POST' });
            const ratingData = await ratingRes.json().catch(() => ({}));
            if (!ratingRes.ok) {
                setStatus({ type: 'warning', message: 'Contest ended, but ratings failed: ' + (ratingData?.message || 'error') });
            } else {
                setStatus({ type: 'success', message: 'Contest ended and ratings calculated!' });
            }
            router.refresh();
        } catch (e) {
            setStatus({ type: 'error', message: 'Error: ' + e });
        } finally {
            setLoading(false);
        }
    }

    const statusColors = {
        success: { bg: 'rgba(96,184,96,0.08)',   color: 'var(--sage, #5f9e6a)', border: 'rgba(96,184,96,0.3)' },
        warning: { bg: 'rgba(200,160,60,0.08)',   color: '#b89a3e',              border: 'rgba(200,160,60,0.3)' },
        error:   { bg: 'rgba(184,96,78,0.08)',    color: 'var(--rose)',          border: 'rgba(184,96,78,0.35)' },
    } as const;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {confirming ? (
                <div style={{
                    padding: '10px 14px', borderRadius: 'var(--r)',
                    border: '1px solid rgba(184,96,78,0.35)',
                    background: 'rgba(184,96,78,0.06)',
                    fontSize: '13px', fontFamily: 'var(--ff-ui)',
                    color: 'var(--rose)', display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                    <span>End this contest now and calculate ratings? This cannot be undone.</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={handleEnd}
                            style={{
                                padding: '5px 12px', borderRadius: 'var(--r)',
                                border: '1px solid rgba(184,96,78,0.4)',
                                background: 'rgba(184,96,78,0.12)', color: 'var(--rose)',
                                fontFamily: 'var(--ff-ui)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                            }}
                        >Confirm</button>
                        <button
                            onClick={() => setConfirming(false)}
                            style={{
                                padding: '5px 12px', borderRadius: 'var(--r)',
                                border: '1px solid var(--ink3, rgba(0,0,0,0.15))',
                                background: 'transparent', color: 'var(--ink5, #777)',
                                fontFamily: 'var(--ff-ui)', fontSize: '12px', cursor: 'pointer',
                            }}
                        >Cancel</button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => { setStatus(null); setConfirming(true); }}
                    disabled={loading}
                    style={{
                        padding: '9px 18px',
                        borderRadius: 'var(--r)',
                        border: '1px solid rgba(184,96,78,0.35)',
                        background: 'rgba(184,96,78,0.08)',
                        color: 'var(--rose)',
                        fontFamily: 'var(--ff-ui)',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: loading ? 'wait' : 'pointer',
                        opacity: loading ? 0.65 : 1,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {loading ? 'Ending…' : 'End Contest & Calc Ratings'}
                </button>
            )}
            {status && (
                <div style={{
                    padding: '7px 12px', borderRadius: 'var(--r)',
                    border: `1px solid ${statusColors[status.type].border}`,
                    background: statusColors[status.type].bg,
                    color: statusColors[status.type].color,
                    fontSize: '12px', fontFamily: 'var(--ff-ui)',
                }}>
                    {status.message}
                </div>
            )}
        </div>
    );
}
