'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, Users } from 'lucide-react';

type Badge = {
    id: string;
    name: string;
    textureUrl: string | null;
    createdAt: string;
    _count: { users: number };
};

// Predefined texture options
const TEXTURE_OPTIONS = [
    { label: 'None (Solid)', value: '' },
    { label: 'Sage Gradient', value: 'linear-gradient(135deg, #6b9478, #4a7a5c)' },
    { label: 'Amber Gradient', value: 'linear-gradient(135deg, #b8853a, #d4a84e)' },
    { label: 'Rose Gradient', value: 'linear-gradient(135deg, #b8604e, #d47a68)' },
    { label: 'Violet Gradient', value: 'linear-gradient(135deg, #7b6aab, #9582c5)' },
    { label: 'Slate Gradient', value: 'linear-gradient(135deg, #5878a0, #7298c0)' },
    { label: 'Gold Shimmer', value: 'linear-gradient(135deg, #c8a24e, #f0d878, #c8a24e)' },
    { label: 'Midnight', value: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' },
    { label: 'Emerald', value: 'linear-gradient(135deg, #0d5e3c, #1a8a5c, #2aad72)' },
    { label: 'Sunset', value: 'linear-gradient(135deg, #c44536, #e76f51, #f4a261)' },
    { label: 'Ocean', value: 'linear-gradient(135deg, #264653, #2a9d8f, #48c9b0)' },
    { label: 'Berry', value: 'linear-gradient(135deg, #7b2d8e, #a855f7, #c084fc)' },
];

function BadgePreview({ name, textureUrl, size = 'normal' }: { name: string; textureUrl?: string | null; size?: 'normal' | 'large' }) {
    const isLarge = size === 'large';
    const hasTexture = textureUrl && textureUrl.length > 0;

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'var(--ff-mono)',
                fontSize: isLarge ? '11px' : '10px',
                letterSpacing: '0.06em',
                padding: isLarge ? '4px 12px' : '3px 9px',
                borderRadius: '99px',
                background: hasTexture ? textureUrl! : 'rgba(107,148,120,0.12)',
                color: hasTexture ? 'rgba(255,255,255,0.92)' : 'var(--sage)',
                border: hasTexture ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--sage-border)',
                textShadow: hasTexture ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                fontWeight: 500,
                whiteSpace: 'nowrap',
            }}
        >
            ✦ {name}
        </span>
    );
}

export function AdminBadgesSection({ initialBadges }: { initialBadges: Badge[] }) {
    const router = useRouter();
    const [badges, setBadges] = useState<Badge[]>(initialBadges);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newTexture, setNewTexture] = useState('');
    const [customTexture, setCustomTexture] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    const effectiveTexture = newTexture === '__custom__' ? customTexture : newTexture;

    async function handleCreate() {
        if (!newName.trim()) {
            setError('Badge name is required');
            return;
        }
        setError('');
        setCreating(true);
        try {
            const res = await fetch('/api/admin/badges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName.trim(),
                    textureUrl: effectiveTexture || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to create badge');
                return;
            }
            setBadges([{ ...data, _count: { users: 0 } }, ...badges]);
            setNewName('');
            setNewTexture('');
            setCustomTexture('');
            setShowCreate(false);
            router.refresh();
        } catch {
            setError('An error occurred');
        } finally {
            setCreating(false);
        }
    }

    async function handleDelete(badgeId: string, badgeName: string) {
        if (!confirm(`Delete badge "${badgeName}"? This will remove it from all users.`)) return;
        try {
            const res = await fetch(`/api/admin/badges?id=${badgeId}`, { method: 'DELETE' });
            if (res.ok) {
                setBadges(badges.filter(b => b.id !== badgeId));
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete badge');
            }
        } catch {
            alert('An error occurred');
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <p className="sec-label" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Manage Badges</p>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    style={{
                        fontFamily: 'var(--ff-mono)',
                        fontSize: '11px',
                        color: showCreate ? 'var(--rose)' : 'var(--sage)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        letterSpacing: '0.06em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}
                >
                    {showCreate ? <><X size={12} /> Cancel</> : <><Plus size={12} /> New Badge</>}
                </button>
            </div>

            {/* Create Badge Form */}
            {showCreate && (
                <div
                    className="fade-in"
                    style={{
                        padding: '20px 24px',
                        marginBottom: '20px',
                        background: 'rgba(0,0,0,0.02)',
                        borderRadius: 'var(--r)',
                        border: '1px solid var(--border, rgba(0,0,0,0.06))',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Name */}
                        <div className="input-group">
                            <label className="input-label">Badge Name</label>
                            <input
                                className="input"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="e.g. Beta Tester, Champion 2026..."
                                maxLength={50}
                                style={{ fontSize: '13px' }}
                            />
                        </div>

                        {/* Texture / Background */}
                        <div className="input-group">
                            <label className="input-label">Background Texture</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                                {TEXTURE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value || 'none'}
                                        onClick={() => { setNewTexture(opt.value); setCustomTexture(''); }}
                                        title={opt.label}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            border: newTexture === opt.value && newTexture !== '__custom__'
                                                ? '2px solid var(--sage)'
                                                : '2px solid rgba(0,0,0,0.08)',
                                            background: opt.value || 'rgba(255,255,255,0.7)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '9px',
                                            color: opt.value ? 'rgba(255,255,255,0.7)' : 'var(--ink5)',
                                            boxShadow: newTexture === opt.value ? '0 0 0 3px var(--sage-bg)' : 'none',
                                        }}
                                    >
                                        {!opt.value && '∅'}
                                    </button>
                                ))}
                                {/* Custom option */}
                                <button
                                    onClick={() => setNewTexture('__custom__')}
                                    title="Custom CSS"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        border: newTexture === '__custom__'
                                            ? '2px solid var(--sage)'
                                            : '2px dashed rgba(0,0,0,0.15)',
                                        background: customTexture || 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '13px',
                                        color: 'var(--ink5)',
                                        boxShadow: newTexture === '__custom__' ? '0 0 0 3px var(--sage-bg)' : 'none',
                                    }}
                                >
                                    +
                                </button>
                            </div>
                            {newTexture === '__custom__' && (
                                <input
                                    className="input"
                                    value={customTexture}
                                    onChange={e => setCustomTexture(e.target.value)}
                                    placeholder="CSS gradient, e.g. linear-gradient(135deg, #ff6b6b, #ffa07a)"
                                    style={{ fontSize: '12px', marginTop: '8px', fontFamily: 'var(--ff-mono)' }}
                                />
                            )}
                        </div>

                        {/* Live Preview */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>Preview:</span>
                            <BadgePreview name={newName || 'Badge Name'} textureUrl={effectiveTexture} size="large" />
                        </div>

                        {error && (
                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--rose)' }}>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            className="btn btn-sage btn-sm"
                            style={{ alignSelf: 'flex-start', gap: '6px' }}
                        >
                            {creating ? <span className="spin" style={{ width: '12px', height: '12px' }} /> : <Plus size={14} />}
                            Create Badge
                        </button>
                    </div>
                </div>
            )}

            {/* Badge Grid */}
            {badges.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: '12px' }}>
                    No badges yet. Create your first badge above.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                borderRadius: 'var(--r)',
                                background: 'rgba(255,255,255,0.4)',
                                border: '1px solid rgba(0,0,0,0.06)',
                                transition: 'all 0.15s',
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                                <BadgePreview name={badge.name} textureUrl={badge.textureUrl} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Users size={10} style={{ color: 'var(--ink5)' }} />
                                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>
                                        {badge._count.users} user{badge._count.users !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(badge.id, badge.name)}
                                title="Delete badge"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--ink5)',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    transition: 'all 0.15s',
                                    display: 'flex',
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
