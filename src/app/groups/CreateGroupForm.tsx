'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateGroupForm() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function submit() {
        const trimmed = name.trim();
        if (!trimmed) return;
        setLoading(true);
        setError('');
        const res = await fetch('/api/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: trimmed }),
        });
        setLoading(false);
        if (!res.ok) {
            const json = await res.json().catch(() => null);
            setError(json?.error || 'Unable to create group');
            return;
        }
        setName('');
        router.refresh();
    }

    return (
        <div className="g" style={{ padding: '16px 18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input
                className="input"
                placeholder="New group name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ maxWidth: '260px' }}
            />
            <button className="btn btn-sage btn-sm" onClick={submit} disabled={loading || name.trim().length === 0}>
                {loading ? 'Creating…' : 'Create group'}
            </button>
            {error && <span style={{ fontSize: '12px', color: 'var(--rose, #c03030)' }}>{error}</span>}
        </div>
    );
}
