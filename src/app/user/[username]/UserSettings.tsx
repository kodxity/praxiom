'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserSettings({ user }: { user: any }) {
    const [tab, setTab] = useState<'profile' | 'password' | null>(null);
    const [description, setDescription] = useState(user.description || '');
    const router = useRouter();

    // profile save
    async function saveProfile() {
        await fetch('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify({ description }),
            headers: { 'Content-Type': 'application/json' },
        });
        setTab(null);
        router.refresh();
    }

    if (tab === null) {
        return (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => setTab('profile')} className="btn btn-outline btn-sm">Edit Profile</button>
                <button onClick={() => setTab('password')} className="btn btn-outline btn-sm">Change Password</button>
            </div>
        );
    }

    if (tab === 'profile') {
        return (
            <div className="space-y-4 max-w-lg">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">Edit Description</h3>
                <textarea
                    className="input w-full"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Tell the community about yourself..."
                />
                <div className="flex gap-2">
                    <button onClick={saveProfile} className="btn btn-primary btn-sm">Save Changes</button>
                    <button
                        onClick={() => { setTab(null); setDescription(user.description || ''); }}
                        className="btn btn-outline btn-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return <ChangePasswordForm onCancel={() => setTab(null)} />;
}

function ChangePasswordForm({ onCancel }: { onCancel: () => void }) {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        const fd = new FormData(e.currentTarget);
        const currentPassword = fd.get('currentPassword') as string;
        const newPassword = fd.get('newPassword') as string;
        const confirm = fd.get('confirm') as string;

        if (newPassword !== confirm) { setError('New passwords do not match.'); return; }
        if (newPassword.length < 8) { setError('New password must be at least 8 characters.'); return; }
        if (newPassword === currentPassword) { setError('New password must be different from your current password.'); return; }

        setLoading(true);
        try {
            const res = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
            setSuccess(true);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px', background: 'var(--sage-bg)', border: '1px solid var(--sage-border)', borderRadius: 'var(--r)', maxWidth: '420px' }}>
                <CheckCircle size={15} style={{ color: 'var(--sage)', flexShrink: 0, marginTop: '1px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--sage)', lineHeight: 1.5 }}>Password updated successfully.</span>
                    <button onClick={onCancel} className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>Done</button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '360px' }}>
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">Change Password</h3>

            {error && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '10px 12px', background: 'var(--rose-bg)', border: '1px solid var(--rose-border)', borderRadius: 'var(--r)' }}>
                    <AlertCircle size={14} style={{ color: 'var(--rose)', flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontSize: '13px', color: 'var(--rose)', lineHeight: 1.5 }}>{error}</span>
                </div>
            )}

            {([
                { name: 'currentPassword', label: 'Current password', show: showCurrent, toggle: () => setShowCurrent(p => !p) },
                { name: 'newPassword',     label: 'New password',     show: showNew,     toggle: () => setShowNew(p => !p) },
                { name: 'confirm',         label: 'Confirm new password', show: showConfirm, toggle: () => setShowConfirm(p => !p) },
            ] as const).map(({ name, label, show, toggle }) => (
                <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontFamily: 'var(--ff-ui)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--ink3)', textTransform: 'uppercase' }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            name={name}
                            type={show ? 'text' : 'password'}
                            required
                            autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'}
                            className="input"
                            style={{ paddingRight: '38px', width: '100%' }}
                        />
                        <button type="button" tabIndex={-1} onClick={toggle}
                            aria-label={show ? 'Hide' : 'Show'}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '3px', color: 'var(--ink5)', display: 'flex', lineHeight: 0 }}>
                            {show ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                </div>
            ))}

            <div className="flex gap-2">
                <button type="submit" disabled={loading} className="btn btn-primary btn-sm" style={{ opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Saving…' : 'Update password'}
                </button>
                <button type="button" onClick={onCancel} className="btn btn-outline btn-sm">Cancel</button>
            </div>
        </form>
    );
}
