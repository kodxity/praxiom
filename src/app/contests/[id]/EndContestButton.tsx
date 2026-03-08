'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function EndContestButton({ contestId }: { contestId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleEnd() {
        if (!confirm('End this contest now and calculate ratings? This cannot be undone.')) return;
        setLoading(true);
        try {
            // Set endTime to now
            const endRes = await fetch(`/api/contests/${contestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endTime: new Date().toISOString() }),
            });
            if (!endRes.ok) {
                alert('Failed to end contest: ' + (await endRes.text()));
                return;
            }
            // Calculate ratings
            const ratingRes = await fetch(`/api/contests/${contestId}/calculate-ratings`, { method: 'POST' });
            const ratingData = await ratingRes.json();
            if (!ratingRes.ok) {
                alert('Contest ended, but ratings: ' + (ratingData.message || 'error'));
            } else {
                alert('Contest ended and ratings calculated!');
            }
            router.refresh();
        } catch (e) {
            alert('Error: ' + e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleEnd}
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
    );
}
