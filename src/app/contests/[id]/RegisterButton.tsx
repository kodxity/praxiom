'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RegisterButton({
    contestId,
    isRegistered,
    mini = false,
}: {
    contestId: string;
    isRegistered: boolean;
    mini?: boolean;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function register() {
        if (loading) return;
        setLoading(true);
        try {
            await fetch(`/api/contests/${contestId}/register`, { method: 'POST' });
            router.refresh();
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    if (isRegistered) {
        if (mini) return (
            <span style={{ fontSize: '11px', fontFamily: 'var(--ff-mono)', color: 'var(--sage)', whiteSpace: 'nowrap' }}>✓ Registered</span>
        );
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'var(--sage-bg)', border: '1px solid var(--sage-border)', borderRadius: 'var(--r)', fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 500, color: 'var(--sage)' }}>
                ✓ Registered
            </span>
        );
    }

    if (mini) {
        return (
            <button
                onClick={register}
                disabled={loading}
                style={{
                    background: 'none', border: 'none', padding: '0',
                    fontSize: '11px', fontFamily: 'var(--ff-mono)',
                    color: 'var(--sage)', cursor: loading ? 'wait' : 'pointer',
                    whiteSpace: 'nowrap', opacity: loading ? 0.6 : 1,
                }}
            >
                {loading ? 'Registering…' : 'Register'}
            </button>
        );
    }

    return (
        <button
            onClick={register}
            disabled={loading}
            className="btn btn-sage"
            style={{ padding: '10px 22px', fontSize: '14px', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
        >
            {loading ? 'Registering…' : 'Register for Contest'}
        </button>
    );
}
