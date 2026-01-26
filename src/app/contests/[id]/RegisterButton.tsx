'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RegisterButton({ contestId, isRegistered }: { contestId: string, isRegistered: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function register() {
        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const res = await fetch(`/api/contests/${contestId}/register`, { method: 'POST' });
            router.refresh();
        } catch (e) { console.error(e) }
        finally { setLoading(false); }
    }

    if (isRegistered) {
        return <div className="text-green-600 font-bold px-4 py-2 bg-green-50 rounded border border-green-200">Registered</div>;
    }

    return (
        <button onClick={register} disabled={loading} className="btn btn-primary">
            {loading ? 'Registering...' : 'Register for Contest'}
        </button>
    )
}
