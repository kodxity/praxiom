<<<<<<< HEAD
'use client';
import { useRouter } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserApproval({ user }: { user: any }) {
    const router = useRouter();
    async function approve() {
        await fetch('/api/admin/users', {
            method: 'PUT',
            body: JSON.stringify({ userId: user.id, action: 'approve' }),
            headers: { 'Content-Type': 'application/json' }
        });
        router.refresh();
    }

    return (
        <div className="flex items-center justify-between p-4 border rounded bg-background shadow-sm">
            <div>
                <div className="font-bold flex items-center gap-2">
                    {user.username}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                {user.description && <div className="text-sm mt-2 p-2 bg-muted/50 rounded">{user.description}</div>}
            </div>
            <button onClick={approve} className="btn btn-primary btn-sm px-4">Approve</button>
        </div>
    )
}
=======
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserApproval({ user }: { user: any }) {
    const router = useRouter();
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState<'approve' | 'deny' | null>(null);

    async function act(action: 'approve' | 'deny') {
        setLoading(action);
        await fetch('/api/admin/users', {
            method: 'PUT',
            body: JSON.stringify({ userId: user.id, action }),
            headers: { 'Content-Type': 'application/json' }
        });
        setDone(true);
        router.refresh();
    }

    if (done) return null;

    const initials = (user.username as string).slice(0, 2).toUpperCase();
    const isTeacher = user.isTeacher;

    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            padding: '14px 16px', borderRadius: 'var(--r)',
            background: 'rgba(0,0,0,0.025)', border: '1px solid var(--border)',
            animation: 'fade-in 0.25s both',
        }}>
            {/* Avatar initials */}
            <div style={{
                width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                background: isTeacher ? 'rgba(88,120,160,0.12)' : 'rgba(107,148,120,0.12)',
                border: `1px solid ${isTeacher ? 'rgba(88,120,160,0.25)' : 'rgba(107,148,120,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--ff-mono)', fontSize: '11px', fontWeight: 600,
                color: isTeacher ? 'var(--slate, #5878a0)' : 'var(--sage)',
            }}>
                {initials}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>
                        {user.username}
                    </span>
                    <span style={{
                        fontSize: '10px', fontFamily: 'var(--ff-mono)', padding: '1px 7px', borderRadius: '99px',
                        background: isTeacher ? 'rgba(88,120,160,0.1)' : 'rgba(107,148,120,0.1)',
                        color: isTeacher ? 'var(--slate, #5878a0)' : 'var(--sage)',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>
                        {isTeacher ? 'Teacher' : 'Student'}
                    </span>
                </div>
                {user.displayName && (
                    <div style={{ fontSize: '12px', color: 'var(--ink3)', marginBottom: '2px' }}>
                        {user.displayName}
                    </div>
                )}
                {user.email && (
                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)', marginBottom: '2px' }}>
                        {user.email}
                    </div>
                )}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {user.school && (
                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', background: 'rgba(0,0,0,0.04)', padding: '1px 7px', borderRadius: '99px' }}>
                            {user.school.shortName} · {user.school.district}
                        </span>
                    )}
                    {user.taughtGroup && (
                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink4)', background: 'rgba(107,148,120,0.08)', padding: '1px 7px', borderRadius: '99px' }}>
                            Group: {user.taughtGroup.name}
                        </span>
                    )}
                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink6, var(--ink5))' }}>
                        Applied {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <button
                    onClick={() => act('approve')}
                    disabled={loading !== null}
                    className="btn btn-sage btn-sm"
                    style={{ opacity: loading !== null ? 0.6 : 1, minWidth: '72px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <CheckCircle size={13} />
                    {loading === 'approve' ? '…' : 'Approve'}
                </button>
                <button
                    onClick={() => act('deny')}
                    disabled={loading !== null}
                    className="btn btn-ghost btn-sm"
                    style={{ opacity: loading !== null ? 0.6 : 1, color: 'var(--rose, #c03030)', minWidth: '72px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <XCircle size={13} />
                    {loading === 'deny' ? '…' : 'Deny'}
                </button>
            </div>
        </div>
    );
}

>>>>>>> LATESTTHISONE-NEWMODES
