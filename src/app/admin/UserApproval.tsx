'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserApproval({ user }: { user: any }) {
    const router = useRouter();
    const [approved, setApproved] = useState(false);
    const [loading, setLoading] = useState(false);

    async function approve() {
        setLoading(true);
        await fetch('/api/admin/users', {
            method: 'PUT',
            body: JSON.stringify({ userId: user.id, action: 'approve' }),
            headers: { 'Content-Type': 'application/json' }
        });
        setApproved(true); // optimistic: hide immediately
        router.refresh();
    }

    if (approved) return null;

    const initials = (user.username as string).slice(0, 2).toUpperCase();

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: 'var(--r)',
            background: 'rgba(0,0,0,0.025)', border: '1px solid var(--border)',
            animation: 'fade-in 0.25s both',
        }}>
            {/* Avatar initials */}
            <div style={{
                width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                background: 'rgba(107,148,120,0.15)', border: '1px solid rgba(107,148,120,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--ff-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--sage)',
            }}>
                {initials}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>
                    {user.username}
                </div>
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', marginTop: '1px' }}>
                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                {user.description && (
                    <div style={{ fontSize: '12px', color: 'var(--ink3)', marginTop: '4px', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        &ldquo;{user.description}&rdquo;
                    </div>
                )}
            </div>

            {/* Approve button */}
            <button
                onClick={approve}
                disabled={loading}
                className="btn btn-sage btn-sm"
                style={{ flexShrink: 0, opacity: loading ? 0.6 : 1 }}
            >
                {loading ? '…' : 'Approve'}
            </button>
        </div>
    );
}

