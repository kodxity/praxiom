<<<<<<< HEAD
'use client';
import { useRouter } from 'next/navigation';

export default function NewContestPage() {
    const router = useRouter();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);

        const res = await fetch('/api/contests', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(form)),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            router.push('/contests');
            router.refresh();
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create Contest</h1>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input name="title" required className="input" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" className="input" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Time</label>
                        <input name="startTime" type="datetime-local" required className="input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Time</label>
                        <input name="endTime" type="datetime-local" required className="input" />
                    </div>
                </div>
                <button className="btn btn-primary w-full">Create Contest</button>
            </form>
        </div>
    )
}
=======
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const THEME_CARDS = [
    {
        slug: 'global',
        name: 'Axiom',
        tagline: 'Enter the Axiom.',
        bg: 'linear-gradient(140deg, #eeeae3 0%, #ddd8cf 100%)',
        accent: '#6b9478',
        text: '#18160f',
        textMuted: '#8a8274',
        dark: false,
    },
    {
        slug: 'jade-city',
        name: 'Jade City',
        tagline: 'The jade gates are open.',
        bg: 'linear-gradient(140deg, #0d1a12 0%, #0a140d 100%)',
        accent: '#6db87a',
        text: 'rgba(200,240,200,0.92)',
        textMuted: 'rgba(150,200,155,0.55)',
        dark: true,
    },
    {
        slug: 'devil-mountain',
        name: 'Devil Mountain',
        tagline: 'Ascend if you dare.',
        bg: 'linear-gradient(140deg, #1a0808 0%, #2a0d0d 100%)',
        accent: '#c45a3a',
        text: 'rgba(255,220,200,0.90)',
        textMuted: 'rgba(200,160,140,0.55)',
        dark: true,
    },
    {
        slug: 'murder-mystery',
        name: 'Murder Mystery',
        tagline: 'The truth lies in the numbers.',
        bg: 'linear-gradient(140deg, #12101e 0%, #181428 100%)',
        accent: '#9b7fd4',
        text: 'rgba(220,210,250,0.90)',
        textMuted: 'rgba(160,150,200,0.55)',
        dark: true,
    },
    {
        slug: 'ancient-ruins',
        name: 'Ancient Ruins',
        tagline: 'Decipher what was lost.',
        bg: 'linear-gradient(140deg, #2e2210 0%, #241808 100%)',
        accent: '#c49a3a',
        text: 'rgba(255,240,200,0.88)',
        textMuted: 'rgba(195,175,130,0.55)',
        dark: true,
    },
    {
        slug: 'cipher-lab',
        name: 'Cipher Lab',
        tagline: 'Break the code. Find the pattern.',
        bg: 'linear-gradient(140deg, #080e1a 0%, #0a1220 100%)',
        accent: '#4a9fd4',
        text: 'rgba(180,220,255,0.90)',
        textMuted: 'rgba(120,165,210,0.55)',
        dark: true,
    },
    {
        slug: 'enchanted-forest',
        name: 'Enchanted Forest',
        tagline: 'The forest holds its secrets.',
        bg: 'linear-gradient(140deg, #1a2e1a 0%, #0d2614 100%)',
        accent: '#72b84a',
        text: 'rgba(200,240,180,0.90)',
        textMuted: 'rgba(140,185,120,0.55)',
        dark: true,
    },
    {
        slug: 'the-conclave',
        name: 'The Conclave',
        tagline: 'By invitation only.',
        bg: 'linear-gradient(140deg, #0e0e16 0%, #141420 100%)',
        accent: '#8a7adb',
        text: 'rgba(220,220,240,0.90)',
        textMuted: 'rgba(160,155,195,0.55)',
        dark: true,
    },
];

const MONO = 'var(--ff-mono)';
const LABEL_STYLE = {
    display: 'block' as const,
    fontFamily: MONO,
    fontSize: '10px',
    letterSpacing: '0.14em',
    color: 'var(--ink5)',
    textTransform: 'uppercase' as const,
    marginBottom: '8px',
};

export default function NewContestPage() {
    const router = useRouter();
    const [selectedTheme, setSelectedTheme] = useState('global');
    const [accentColor, setAccentColor] = useState('');
    const [contestType, setContestType] = useState<'individual' | 'team' | 'relay'>('individual');
    const [error, setError] = useState('');

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        const form = new FormData(e.currentTarget);
        const data = Object.fromEntries(form) as Record<string, string>;
        data.themeSlug = selectedTheme;
        data.contestType = contestType;
        if (accentColor) data.accentColor = accentColor;

        const res = await fetch('/api/contests', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
            const contest = await res.json();
            router.push(`/contests/${contest.id}`);
            router.refresh();
        } else {
            setError('Failed to create contest. Check all fields and try again.');
        }
    }

    const activeCard = THEME_CARDS.find(t => t.slug === selectedTheme) ?? THEME_CARDS[0];

    return (
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>
            {/* Header */}
            <div style={{ marginBottom: '36px' }}>
                <p style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '10px' }}>ADMIN · NEW CONTEST</p>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.1, marginBottom: '8px' }}>
                    Create Contest
                </h1>
                <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--ink4)', lineHeight: 1.6 }}>
                    Set up a new competition. You can add problems after creation.
                </p>
            </div>

            <form onSubmit={onSubmit}>
                <div className="g" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

                    {/* Title */}
                    <div>
                        <label style={LABEL_STYLE}>Contest Title</label>
                        <input
                            name="title"
                            placeholder="e.g. Jade City Open 2026"
                            required
                            className="input"
                            style={{ width: '100%', fontFamily: 'var(--ff-display)', fontSize: '18px', fontStyle: 'italic' }}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={LABEL_STYLE}>Description <span style={{ opacity: 0.5 }}>(optional)</span></label>
                        <textarea
                            name="description"
                            placeholder="Short description shown on the contest card…"
                            className="input"
                            rows={3}
                            style={{ width: '100%', resize: 'vertical', fontFamily: 'var(--ff-body)', fontSize: '14px', lineHeight: 1.7 }}
                        />
                    </div>

                    {/* Times */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={LABEL_STYLE}>Start Time</label>
                            <input name="startTime" type="datetime-local" required className="input" style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label style={LABEL_STYLE}>End Time</label>
                            <input name="endTime" type="datetime-local" required className="input" style={{ width: '100%' }} />
                        </div>
                    </div>

                    {/* Contest Type */}
                    <div>
                        <label style={LABEL_STYLE}>Contest Type</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {(['individual', 'team', 'relay'] as const).map(ct => (
                                <button key={ct} type="button" onClick={() => setContestType(ct)} style={{ fontFamily: MONO, fontSize: '11px', letterSpacing: '0.1em', padding: '8px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer', textTransform: 'uppercase', background: contestType === ct ? 'var(--sage-bg)' : 'rgba(0,0,0,0.04)', color: contestType === ct ? 'var(--sage)' : 'var(--ink4)', fontWeight: contestType === ct ? 700 : 400, boxShadow: contestType === ct ? '0 0 0 1px var(--sage-border)' : 'none' }}>
                                    {ct}
                                </button>
                            ))}
                        </div>
                        <p style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink5)', marginTop: '8px', lineHeight: 1.5 }}>
                            {contestType === 'individual' && 'Solo sequential contest — users solve problems in order.'}
                            {contestType === 'team' && 'Team contest (up to 6) — any member solves any problem in any order.'}
                            {contestType === 'relay' && 'Relay contest — 3-person teams with sequential unlocks per slot.'}
                        </p>
                    </div>

                    {/* Theme Picker */}
                    <div>
                        <label style={LABEL_STYLE}>Theme</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                            {THEME_CARDS.map(t => {
                                const isSelected = selectedTheme === t.slug;
                                return (
                                    <button
                                        key={t.slug}
                                        type="button"
                                        onClick={() => {
                                            setSelectedTheme(t.slug);
                                            setAccentColor(''); // reset override when switching theme
                                        }}
                                        style={{
                                            background: t.bg,
                                            border: isSelected ? `2px solid ${t.accent}` : '2px solid transparent',
                                            borderRadius: '10px',
                                            padding: '14px 14px 12px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'transform 0.15s, box-shadow 0.15s',
                                            boxShadow: isSelected ? `0 0 0 3px ${t.accent}33` : '0 1px 4px rgba(0,0,0,0.14)',
                                            transform: isSelected ? 'translateY(-2px)' : 'none',
                                            position: 'relative',
                                            outline: 'none',
                                        }}
                                    >
                                        {/* Accent dot */}
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.accent, marginBottom: '8px' }} />
                                        <div style={{ fontFamily: 'var(--ff-display)', fontSize: '14px', fontWeight: 600, color: t.text, marginBottom: '3px', lineHeight: 1.2 }}>
                                            {t.name}
                                        </div>
                                        <div style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '0.06em', color: t.textMuted, lineHeight: 1.4 }}>
                                            {t.tagline}
                                        </div>
                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute', top: 7, right: 8,
                                                fontFamily: MONO, fontSize: '8px', letterSpacing: '0.1em',
                                                color: t.accent, background: `${t.accent}22`,
                                                borderRadius: 4, padding: '1px 5px',
                                            }}>SELECTED</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Live preview strip */}
                        <div style={{
                            background: activeCard.bg,
                            borderRadius: '8px',
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            border: `1px solid ${activeCard.accent}33`,
                        }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: accentColor || activeCard.accent, flexShrink: 0, boxShadow: `0 0 12px ${accentColor || activeCard.accent}66` }} />
                            <div>
                                <div style={{ fontFamily: 'var(--ff-display)', fontSize: '15px', fontStyle: 'italic', color: activeCard.text, marginBottom: '2px' }}>
                                    {activeCard.name}
                                </div>
                                <div style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '0.12em', color: activeCard.textMuted }}>
                                    {activeCard.tagline}
                                </div>
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '0.12em', color: activeCard.textMuted, textTransform: 'uppercase' }}>
                                    Accent override
                                </label>
                                <input
                                    type="color"
                                    value={accentColor || activeCard.accent}
                                    onChange={e => setAccentColor(e.target.value)}
                                    style={{ width: 28, height: 28, border: 'none', padding: 0, background: 'transparent', cursor: 'pointer', borderRadius: '50%' }}
                                    title="Override accent color"
                                />
                                {accentColor && (
                                    <button
                                        type="button"
                                        onClick={() => setAccentColor('')}
                                        style={{ fontFamily: MONO, fontSize: '9px', color: activeCard.textMuted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p style={{ fontFamily: MONO, fontSize: '11px', color: '#c45a3a', letterSpacing: '0.05em' }}>{error}</p>
                    )}

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
                        <a href="/contests" className="btn btn-ghost">Cancel</a>
                        <button type="submit" className="btn btn-sage">Create Contest →</button>
                    </div>
                </div>
            </form>
        </div>
    );
}
>>>>>>> LATESTTHISONE-NEWMODES
