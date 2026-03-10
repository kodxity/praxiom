<<<<<<< HEAD
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function CalculateRatingsButton({ contestId }: { contestId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onClick() {
        if (!confirm("Are you sure? This should only be done once per contest. Proceed?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/contests/${contestId}/calculate-ratings`, { method: 'POST' });
            if (res.ok) {
                alert("Ratings calculated successfully!");
                router.refresh();
            } else {
                const json = await res.json();
                alert("Error: " + (json.message || "Unknown error"));
            }
        } catch (e) {
            alert("Error: " + e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mt-8 border-t pt-8">
            <h3 className="font-bold mb-2">Finalize Contest</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Calculate rating changes for all participants based on their rank.
            </p>
            <button onClick={onClick} disabled={loading} className="btn btn-primary w-full bg-purple-600 hover:bg-purple-700">
                {loading ? 'Calculating...' : 'Calculate Ratings & Update Profiles'}
            </button>
        </div>
    )
}
=======
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function CalculateRatingsButton({ contestId }: { contestId: string }) {
    const [loading, setLoading]       = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [status, setStatus]         = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const router = useRouter();

    async function handleCalculate() {
        setConfirming(false);
        setLoading(true);
        setStatus(null);
        try {
            const res = await fetch(`/api/contests/${contestId}/calculate-ratings`, { method: 'POST' });
            const json = await res.json().catch(() => ({}));
            if (res.ok) {
                setStatus({ type: 'success', message: 'Ratings calculated successfully!' });
                router.refresh();
            } else {
                setStatus({ type: 'error', message: 'Error: ' + (json?.message || 'Unknown error') });
            }
        } catch (e) {
            setStatus({ type: 'error', message: 'Error: ' + e });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--ink2, rgba(0,0,0,0.1))' }}>
            <h3 style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--ink)', marginBottom: '8px', letterSpacing: '0.02em' }}>
                Finalize Contest
            </h3>
            <p style={{ fontFamily: 'var(--ff-ui)', fontSize: '13px', color: 'var(--ink4, #888)', marginBottom: '16px' }}>
                Calculate rating changes for all participants based on their rank.
            </p>
            {confirming ? (
                <div style={{
                    padding: '10px 14px', borderRadius: 'var(--r)',
                    border: '1px solid rgba(120,80,200,0.35)',
                    background: 'rgba(120,80,200,0.06)',
                    fontSize: '13px', fontFamily: 'var(--ff-ui)',
                    display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                    <span style={{ color: 'var(--ink)' }}>Are you sure? This should only be done once per contest.</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={handleCalculate}
                            style={{
                                padding: '6px 16px', borderRadius: 'var(--r)',
                                border: '1px solid rgba(120,80,200,0.4)',
                                background: 'rgba(120,80,200,0.12)', color: '#9b78e8',
                                fontFamily: 'var(--ff-ui)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                            }}
                        >Confirm</button>
                        <button
                            onClick={() => setConfirming(false)}
                            style={{
                                padding: '6px 16px', borderRadius: 'var(--r)',
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
                        width: '100%', padding: '9px 18px', borderRadius: 'var(--r)',
                        border: '1px solid rgba(120,80,200,0.35)',
                        background: 'rgba(120,80,200,0.1)', color: '#9b78e8',
                        fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 500,
                        cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.65 : 1,
                    }}
                >
                    {loading ? 'Calculating…' : 'Calculate Ratings & Update Profiles'}
                </button>
            )}
            {status && (
                <div style={{
                    marginTop: 8, padding: '7px 12px', borderRadius: 'var(--r)',
                    border: `1px solid ${status.type === 'success' ? 'rgba(96,184,96,0.3)' : 'rgba(184,96,78,0.35)'}`,
                    background: status.type === 'success' ? 'rgba(96,184,96,0.08)' : 'rgba(184,96,78,0.08)',
                    color: status.type === 'success' ? 'var(--sage, #5f9e6a)' : 'var(--rose)',
                    fontSize: '12px', fontFamily: 'var(--ff-ui)',
                }}>
                    {status.message}
                </div>
            )}
        </div>
    );
}
>>>>>>> LATESTTHISONE-NEWMODES
