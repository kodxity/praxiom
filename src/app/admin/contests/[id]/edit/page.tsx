'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const THEME_CARDS = [
    { slug: 'global',           name: 'Axiom',            tagline: 'Enter the Axiom.',               bg: 'linear-gradient(140deg, #eeeae3 0%, #ddd8cf 100%)', accent: '#6b9478', text: '#18160f',                  textMuted: '#8a8274',                  dark: false },
    { slug: 'jade-city',        name: 'Jade City',         tagline: 'The jade gates are open.',       bg: 'linear-gradient(140deg, #0d1a12 0%, #0a140d 100%)', accent: '#6db87a', text: 'rgba(200,240,200,0.92)',  textMuted: 'rgba(150,200,155,0.55)',   dark: true  },
    { slug: 'devil-mountain',   name: 'Devil Mountain',    tagline: 'Ascend if you dare.',            bg: 'linear-gradient(140deg, #1a0808 0%, #2a0d0d 100%)', accent: '#c45a3a', text: 'rgba(255,220,200,0.90)',  textMuted: 'rgba(200,160,140,0.55)',   dark: true  },
    { slug: 'murder-mystery',   name: 'Murder Mystery',    tagline: 'The truth lies in the numbers.', bg: 'linear-gradient(140deg, #12101e 0%, #181428 100%)', accent: '#9b7fd4', text: 'rgba(220,210,250,0.90)',  textMuted: 'rgba(160,150,200,0.55)',   dark: true  },
    { slug: 'ancient-ruins',    name: 'Ancient Ruins',     tagline: 'Decipher what was lost.',        bg: 'linear-gradient(140deg, #2e2210 0%, #241808 100%)', accent: '#c49a3a', text: 'rgba(255,240,200,0.88)',  textMuted: 'rgba(195,175,130,0.55)',   dark: true  },
    { slug: 'cipher-lab',       name: 'Cipher Lab',        tagline: 'Break the code.',                bg: 'linear-gradient(140deg, #080e1a 0%, #0a1220 100%)', accent: '#4a9fd4', text: 'rgba(180,220,255,0.90)',  textMuted: 'rgba(120,165,210,0.55)',   dark: true  },
    { slug: 'enchanted-forest', name: 'Enchanted Forest',  tagline: 'The forest holds its secrets.',  bg: 'linear-gradient(140deg, #1a2e1a 0%, #0d2614 100%)', accent: '#72b84a', text: 'rgba(200,240,180,0.90)',  textMuted: 'rgba(140,185,120,0.55)',   dark: true  },
    { slug: 'the-conclave',     name: 'The Conclave',      tagline: 'By invitation only.',            bg: 'linear-gradient(140deg, #0e0e16 0%, #141420 100%)', accent: '#8a7adb', text: 'rgba(220,220,240,0.90)',  textMuted: 'rgba(160,155,195,0.55)',   dark: true  },
];

const MONO = 'var(--ff-mono)';
const LABEL: React.CSSProperties = { display: 'block', fontFamily: MONO, fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '8px' };

function toLocal(d: Date | string | null): string {
    if (!d) return '';
    const dt = new Date(d);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

export default function EditContestPage() {
    const router = useRouter();
    const rawParams = useParams();
    const contestId = rawParams.id as string;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [themeSlug, setThemeSlug] = useState('global');
    const [accentColor, setAccentColor] = useState('');
    const [status, setStatus] = useState('SCHEDULED');
    const [problems, setProblems] = useState<any[]>([]);
    const [removingProblem, setRemovingProblem] = useState<string | null>(null);
    const [customThemes, setCustomThemes] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/themes').then(r => r.json()).then(setCustomThemes).catch(() => {});
    }, []);

    useEffect(() => {
        fetch(`/api/contests/${contestId}`)
            .then(r => r.json())
            .then(data => {
                setTitle(data.title ?? '');
                setDescription(data.description ?? '');
                setStartTime(toLocal(data.startTime));
                setEndTime(toLocal(data.endTime));
                setThemeSlug(data.themeSlug ?? 'global');
                setAccentColor(data.accentColor ?? '');
                setStatus(data.status ?? 'SCHEDULED');
                setProblems(data.problems ?? []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [contestId]);

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        const res = await fetch(`/api/contests/${contestId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, startTime, endTime, themeSlug, accentColor: accentColor || null, status }),
        });
        setSaving(false);
        if (res.ok) {
            setSuccess('Contest updated successfully.');
        } else {
            setError('Failed to save changes.');
        }
    }

    async function deleteContest() {
        setDeleting(true);
        const res = await fetch(`/api/contests/${contestId}`, { method: 'DELETE' });
        if (res.ok || res.status === 204) {
            router.push('/contests');
            router.refresh();
        } else {
            setError('Failed to delete contest.');
            setDeleting(false);
        }
    }

    async function removeProblem(problemId: string) {
        setRemovingProblem(problemId);
        const res = await fetch(`/api/contests/${contestId}/problems/${problemId}`, { method: 'DELETE' });
        if (res.ok || res.status === 204) {
            setProblems(prev => prev.filter(p => p.id !== problemId));
        } else {
            setError('Failed to remove problem.');
        }
        setRemovingProblem(null);
    }

    const builtinActive = THEME_CARDS.find(t => t.slug === themeSlug);
    const customActive  = customThemes.find((t: any) => t.slug === themeSlug);
    const activeCard = builtinActive ?? (() => {
        const cfg = customActive?.config as any;
        return cfg ? { slug: customActive.slug, name: customActive.name, tagline: cfg.tagline ?? '', bg: cfg.bg ?? '#1a1a2e', accent: cfg.accent ?? '#6b9478', text: cfg.textPrimary ?? '#fff', textMuted: cfg.textMuted ?? 'rgba(255,255,255,0.4)', dark: cfg.navVariant !== 'light' } : null;
    })() ?? THEME_CARDS[0];

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <p style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--ink5)' }}>Loading…</p>
        </div>
    );

    return (
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <Link href={`/contests/${contestId}`} style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--ink5)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '16px' }}>
                    ← Back to Contest
                </Link>
                <p style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '8px' }}>ADMIN · MANAGE CONTEST</p>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.1 }}>
                    {title || 'Edit Contest'}
                </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>

                {/* Edit Form */}
                <form onSubmit={save}>
                    <div className="g" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontStyle: 'italic', color: 'var(--ink)', margin: 0 }}>Details</h2>

                        {/* Title */}
                        <div>
                            <label style={LABEL}>Contest Title</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} required className="input" style={{ width: '100%', fontFamily: 'var(--ff-display)', fontSize: '17px', fontStyle: 'italic' }} />
                        </div>

                        {/* Description */}
                        <div>
                            <label style={LABEL}>Description <span style={{ opacity: 0.5 }}>(optional)</span></label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input" rows={3} style={{ width: '100%', resize: 'vertical', fontFamily: 'var(--ff-body)', fontSize: '14px', lineHeight: 1.7 }} />
                        </div>

                        {/* Times */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={LABEL}>Start Time</label>
                                <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required className="input" style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={LABEL}>End Time</label>
                                <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required className="input" style={{ width: '100%' }} />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label style={LABEL}>Status</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['SCHEDULED', 'ACTIVE', 'ENDED'].map(s => (
                                    <button key={s} type="button" onClick={() => setStatus(s)} style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.1em', padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: status === s ? 'var(--sage-bg)' : 'rgba(0,0,0,0.04)', color: status === s ? 'var(--sage)' : 'var(--ink4)', fontWeight: status === s ? 700 : 400 }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme */}
                        <div>
                            <label style={LABEL}>Theme</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                                {THEME_CARDS.map(t => {
                                    const sel = themeSlug === t.slug;
                                    return (
                                        <button key={t.slug} type="button" onClick={() => { setThemeSlug(t.slug); setAccentColor(''); }}
                                            style={{ background: t.bg, border: sel ? `2px solid ${t.accent}` : '2px solid transparent', borderRadius: '9px', padding: '12px 12px 10px', cursor: 'pointer', textAlign: 'left', boxShadow: sel ? `0 0 0 3px ${t.accent}33` : '0 1px 3px rgba(0,0,0,0.12)', transform: sel ? 'translateY(-1px)' : 'none', outline: 'none', transition: 'all 0.12s', position: 'relative' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.accent, marginBottom: '6px' }} />
                                            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '13px', color: t.text, marginBottom: '2px', lineHeight: 1.2 }}>{t.name}</div>
                                            <div style={{ fontFamily: MONO, fontSize: '8px', color: t.textMuted, lineHeight: 1.3 }}>{t.tagline}</div>
                                            {sel && <div style={{ position: 'absolute', top: 6, right: 7, fontFamily: MONO, fontSize: '7px', color: t.accent, background: `${t.accent}22`, borderRadius: 3, padding: '1px 4px' }}>✓</div>}
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Custom themes */}
                            {customThemes.length > 0 && (
                                <>
                                    <p style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink5)', margin: '10px 0 8px' }}>Custom</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                                        {customThemes.map((t: any) => {
                                            const cfg = t.config as any;
                                            const sel = themeSlug === t.slug;
                                            const acc = cfg.accent ?? '#6b9478';
                                            return (
                                                <button key={t.slug} type="button" onClick={() => { setThemeSlug(t.slug); setAccentColor(''); }}
                                                    style={{ background: cfg.bg ?? '#1a1a2e', border: sel ? `2px solid ${acc}` : '2px solid transparent', borderRadius: '9px', padding: '12px 12px 10px', cursor: 'pointer', textAlign: 'left', boxShadow: sel ? `0 0 0 3px ${acc}33` : '0 1px 3px rgba(0,0,0,0.12)', transform: sel ? 'translateY(-1px)' : 'none', outline: 'none', transition: 'all 0.12s', position: 'relative' }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: acc, marginBottom: '6px' }} />
                                                    <div style={{ fontFamily: 'var(--ff-display)', fontSize: '13px', color: cfg.textPrimary ?? '#fff', marginBottom: '2px', lineHeight: 1.2 }}>{t.name}</div>
                                                    <div style={{ fontFamily: MONO, fontSize: '8px', color: cfg.textMuted ?? 'rgba(255,255,255,0.4)', lineHeight: 1.3 }}>{cfg.tagline}</div>
                                                    {sel && <div style={{ position: 'absolute', top: 6, right: 7, fontFamily: MONO, fontSize: '7px', color: acc, background: `${acc}22`, borderRadius: 3, padding: '1px 4px' }}>✓</div>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                            <div style={{ marginBottom: '6px' }}>
                                <Link href="/admin/themes/new" style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink5)', textDecoration: 'none', letterSpacing: '0.06em' }}>+ Create custom theme →</Link>
                            </div>
                            {/* Preview + accent override */}
                            <div style={{ background: activeCard.bg, borderRadius: '8px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', border: `1px solid ${activeCard.accent}33` }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: accentColor || activeCard.accent, flexShrink: 0, boxShadow: `0 0 10px ${accentColor || activeCard.accent}55` }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: 'var(--ff-display)', fontSize: '14px', fontStyle: 'italic', color: activeCard.text }}>{activeCard.name}</div>
                                    <div style={{ fontFamily: MONO, fontSize: '8px', color: activeCard.textMuted }}>{activeCard.tagline}</div>
                                </div>
                                <label style={{ fontFamily: MONO, fontSize: '9px', color: activeCard.textMuted }}>Accent</label>
                                <input type="color" value={accentColor || activeCard.accent} onChange={e => setAccentColor(e.target.value)} style={{ width: 26, height: 26, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }} />
                                {accentColor && <button type="button" onClick={() => setAccentColor('')} style={{ fontFamily: MONO, fontSize: '9px', color: activeCard.textMuted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>reset</button>}
                            </div>
                        </div>

                        {error && <p style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--rose)', margin: 0 }}>{error}</p>}
                        {success && <p style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--sage)', margin: 0 }}>{success}</p>}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                            <button type="submit" className="btn btn-sage" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
                        </div>
                    </div>
                </form>

                {/* Problems Management */}
                <div className="g" style={{ padding: '32px 36px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontStyle: 'italic', color: 'var(--ink)', margin: 0 }}>
                            Problems <span style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--ink5)', fontStyle: 'normal' }}>({problems.length})</span>
                        </h2>
                        <Link href={`/contests/${contestId}`} className="btn btn-ghost" style={{ fontSize: '12px' }}>
                            + Add Problems
                        </Link>
                    </div>
                    {problems.length === 0 ? (
                        <p style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--ink5)' }}>No problems yet. Go to the contest page to add some.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            {problems.map((p: any, idx: number) => (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: idx < problems.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                                    <span style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink5)', width: '22px', flexShrink: 0 }}>#{idx + 1}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontFamily: 'var(--ff-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>{p.title}</div>
                                        <div style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink5)' }}>{p.points} pts</div>
                                    </div>
                                    <Link
                                        href={`/admin/contests/${contestId}/problems/${p.id}/edit`}
                                        style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--sage)', background: 'var(--sage-bg)', border: '1px solid var(--sage-border)', borderRadius: '6px', padding: '4px 10px', textDecoration: 'none' }}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => removeProblem(p.id)}
                                        disabled={removingProblem === p.id}
                                        style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--rose)', background: 'rgba(184,96,78,0.08)', border: '1px solid rgba(184,96,78,0.18)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', opacity: removingProblem === p.id ? 0.5 : 1 }}
                                    >
                                        {removingProblem === p.id ? '…' : 'Remove'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Danger Zone */}
                <div className="g" style={{ padding: '28px 36px', border: '1px solid rgba(184,96,78,0.22)', background: 'rgba(184,96,78,0.04)' }}>
                    <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontStyle: 'italic', color: 'var(--rose)', margin: '0 0 12px' }}>Danger Zone</h2>
                    <p style={{ fontSize: '13px', color: 'var(--ink4)', marginBottom: '16px', fontWeight: 300 }}>
                        Deleting a contest is permanent and will remove all problems, registrations, and submissions.
                    </p>
                    {!confirmDelete ? (
                        <button onClick={() => setConfirmDelete(true)} style={{ fontFamily: MONO, fontSize: '11px', letterSpacing: '0.06em', color: 'var(--rose)', background: 'rgba(184,96,78,0.10)', border: '1px solid rgba(184,96,78,0.25)', borderRadius: '7px', padding: '8px 18px', cursor: 'pointer' }}>
                            Delete Contest
                        </button>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--rose)' }}>Are you sure? This cannot be undone.</span>
                            <button onClick={deleteContest} disabled={deleting} style={{ fontFamily: MONO, fontSize: '11px', color: '#fff', background: 'var(--rose)', border: 'none', borderRadius: '7px', padding: '8px 18px', cursor: 'pointer' }}>
                                {deleting ? 'Deleting…' : 'Yes, Delete'}
                            </button>
                            <button onClick={() => setConfirmDelete(false)} style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--ink4)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

