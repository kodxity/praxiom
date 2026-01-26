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
