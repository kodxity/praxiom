'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { signOut } from 'next-auth/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserSettings({ user, isAdmin, isOwnProfile }: { user: any; isAdmin?: boolean; isOwnProfile?: boolean }) {
    const [tab, setTab] = useState<'profile' | 'password' | 'delete' | null>(null);
    const [description, setDescription] = useState(user.description || '');
    const router = useRouter();

    // profile save
    async function saveProfile() {
        await fetch('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify({ description, username: user.username }),
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
                <button onClick={() => setTab('delete')} className="btn btn-outline btn-sm" style={{ color: 'var(--rose)', borderColor: 'var(--rose-border)' }}>Delete Account</button>
            </div>
        );
    }

    if (tab === 'delete') {
        return <DeleteAccountForm username={user.username} isAdmin={isAdmin} isOwnProfile={isOwnProfile} onCancel={() => setTab(null)} />;
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

    return <ChangePasswordForm username={user.username} isAdmin={isAdmin} isOwnProfile={isOwnProfile} onCancel={() => setTab(null)} />;
}

function DeleteAccountForm({ username, isAdmin, isOwnProfile, onCancel }: { username: string; isAdmin?: boolean; isOwnProfile?: boolean; onCancel: () => void }) {
    const [confirmUsername, setConfirmUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleDelete() {
        setError('');
        if (confirmUsername !== username) {
            setError('Username does not match.');
            return;
        }
        if (!isAdmin && !password) {
            setError('Password is required.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/user/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: confirmUsername, ...(password && { password }) }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
            await signOut({ callbackUrl: '/' });
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '380px' }}>
            <div style={{ padding: '12px 14px', background: 'var(--rose-bg)', border: '1px solid var(--rose-border)', borderRadius: 'var(--r)' }}>
                <p style={{ fontSize: '13px', color: 'var(--rose)', lineHeight: 1.6, margin: 0 }}>
                    <strong>This is permanent.</strong> Your account will be anonymized — your username on leaderboards and standings will be replaced with a deleted-user placeholder. You will be removed from any groups. This cannot be undone.
                </p>
            </div>

            {error && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '10px 12px', background: 'var(--rose-bg)', border: '1px solid var(--rose-border)', borderRadius: 'var(--r)' }}>
                    <AlertCircle size={14} style={{ color: 'var(--rose)', flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontSize: '13px', color: 'var(--rose)', lineHeight: 1.5 }}>{error}</span>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontFamily: 'var(--ff-ui)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--ink3)', textTransform: 'uppercase' }}>
                    Type your username to confirm
                </label>
                <input
                    className="input"
                    value={confirmUsername}
                    onChange={e => setConfirmUsername(e.target.value)}
                    placeholder={username}
                    autoComplete="off"
                    autoCapitalize="off"
                />
            </div>

            {!isAdmin && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontFamily: 'var(--ff-ui)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--ink3)', textTransform: 'uppercase' }}>
                        Password
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                            style={{ paddingRight: '38px', width: '100%' }}
                        />
                        <button type="button" tabIndex={-1} onClick={() => setShowPassword(p => !p)}
                            aria-label={showPassword ? 'Hide' : 'Show'}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '3px', color: 'var(--ink5)', display: 'flex', lineHeight: 0 }}>
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={handleDelete}
                    disabled={loading || confirmUsername !== username || (!isAdmin && !password)}
                    className="btn btn-sm"
                    style={{ background: 'var(--rose)', color: '#fff', opacity: (loading || confirmUsername !== username || (!isAdmin && !password)) ? 0.5 : 1, cursor: (loading || confirmUsername !== username || (!isAdmin && !password)) ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? 'Deleting…' : 'Permanently delete account'}
                </button>
                <button type="button" onClick={onCancel} className="btn btn-outline btn-sm">Cancel</button>
            </div>
        </div>
    );
}

function ChangePasswordForm({ username, isAdmin, isOwnProfile, onCancel }: { username: string; isAdmin?: boolean; isOwnProfile?: boolean; onCancel: () => void }) {
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
                body: JSON.stringify({ username, currentPassword: currentPassword || undefined, newPassword }),
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
                ...(isAdmin && !isOwnProfile ? [] : [{ name: 'currentPassword', label: 'Current password' as const, show: showCurrent, toggle: () => setShowCurrent(p => !p) }]),
                { name: 'newPassword',     label: 'New password' as const,     show: showNew,     toggle: () => setShowNew(p => !p) },
                { name: 'confirm',         label: 'Confirm new password' as const, show: showConfirm, toggle: () => setShowConfirm(p => !p) },
            ]).map(({ name, label, show, toggle }) => (
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
