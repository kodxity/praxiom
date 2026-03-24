'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { MarkdownEditor } from '@/components/MarkdownEditor';

const MONO = 'var(--ff-mono)';
const LABEL: React.CSSProperties = {
    display: 'block',
    fontFamily: MONO,
    fontSize: '10px',
    letterSpacing: '0.14em',
    color: 'var(--ink5)',
    textTransform: 'uppercase',
    marginBottom: '8px',
};

export default function EditProblemPage() {
    const router = useRouter();
    const rawParams = useParams();
    const contestId = rawParams.id as string;
    const problemId = rawParams.problemId as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [contestTitle, setContestTitle] = useState('');
    const [siblingProblems, setSiblingProblems] = useState<{ id: string; title: string }[]>([]);

    const [title, setTitle] = useState('');
    const [statement, setStatement] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [points, setPoints] = useState(100);
    const [hint, setHint] = useState('');

    useEffect(() => {
        Promise.all([
            fetch(`/api/contests/${contestId}/problems/${problemId}`).then(r => r.json()),
            fetch(`/api/contests/${contestId}`).then(r => r.json()),
        ])
            .then(([prob, contest]) => {
                setTitle(prob.title ?? '');
                setStatement(prob.statement ?? '');
                setCorrectAnswer(prob.correctAnswer ?? '');
                setPoints(prob.points ?? 100);
                setHint(prob.hint ?? '');
                setContestTitle(contest.title ?? '');
                setSiblingProblems(contest.problems ?? []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [contestId, problemId]);

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        const res = await fetch(`/api/contests/${contestId}/problems/${problemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, statement, correctAnswer, points, hint: hint || null }),
        });
        setSaving(false);
        if (res.ok) {
            setSuccess('Problem saved successfully.');
        } else {
            setError('Failed to save changes.');
        }
    }

    async function deleteProblem() {
        setDeleting(true);
        const res = await fetch(`/api/contests/${contestId}/problems/${problemId}`, { method: 'DELETE' });
        if (res.ok || res.status === 204) {
            router.push(`/admin/contests/${contestId}/edit`);
            router.refresh();
        } else {
            setError('Failed to delete problem.');
            setDeleting(false);
        }
    }

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <p style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--ink5)' }}>Loading…</p>
        </div>
    );

    return (
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <Link
                    href={`/admin/contests/${contestId}/edit`}
                    style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--ink5)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '16px' }}
                >
                    ← Back to {contestTitle || 'Contest'}
                </Link>

                {/* Sibling problem quick-nav */}
                {siblingProblems.length > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {siblingProblems.map((p, i) => {
                            const letter = String.fromCharCode(65 + i);
                            const isCurrent = p.id === problemId;
                            return (
                                <Link
                                    key={p.id}
                                    href={`/admin/contests/${contestId}/problems/${p.id}/edit`}
                                    title={p.title}
                                    style={{
                                        fontFamily: MONO,
                                        fontSize: '11px',
                                        letterSpacing: '0.06em',
                                        padding: '4px 11px',
                                        borderRadius: '99px',
                                        border: isCurrent ? '1px solid var(--sage)' : '1px solid var(--border)',
                                        background: isCurrent ? 'var(--sage-bg)' : 'transparent',
                                        color: isCurrent ? 'var(--sage)' : 'var(--ink4)',
                                        textDecoration: 'none',
                                        transition: 'all 0.12s',
                                        pointerEvents: isCurrent ? 'none' : 'auto',
                                    }}
                                >
                                    {letter}
                                </Link>
                            );
                        })}
                    </div>
                )}
                <p style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '8px' }}>
                    ADMIN · EDIT PROBLEM
                </p>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.1 }}>
                    {title || 'Edit Problem'}
                </h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Edit form */}
                <form onSubmit={save}>
                    <div className="g" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                        <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontStyle: 'italic', color: 'var(--ink)', margin: 0 }}>
                            Problem Details
                        </h2>

                        {/* Title */}
                        <div>
                            <label style={LABEL}>Title</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                className="input"
                                style={{ width: '100%', fontFamily: 'var(--ff-ui)', fontSize: '15px' }}
                                placeholder="Problem title…"
                            />
                        </div>

                        {/* Points */}
                        <div>
                            <label style={LABEL}>Points (XP)</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {[50, 75, 100, 125, 150, 200, 250].map(v => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setPoints(v)}
                                        style={{
                                            fontFamily: MONO,
                                            fontSize: '11px',
                                            padding: '6px 14px',
                                            borderRadius: '99px',
                                            border: points === v ? '1px solid var(--sage)' : '1px solid var(--border)',
                                            background: points === v ? 'var(--sage-bg)' : 'transparent',
                                            color: points === v ? 'var(--sage)' : 'var(--ink4)',
                                            cursor: 'pointer',
                                            transition: 'all 0.12s',
                                        }}
                                    >
                                        {v}
                                    </button>
                                ))}
                                <input
                                    type="number"
                                    value={points}
                                    onChange={e => setPoints(Number(e.target.value))}
                                    min={1}
                                    className="input"
                                    style={{ width: '80px', fontFamily: MONO, fontSize: '12px' }}
                                />
                            </div>
                            <p style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink5)', marginTop: '6px' }}>
                                ≤80 = Easy · 81–120 = Medium · 121–200 = Hard · &gt;200 = Expert
                            </p>
                        </div>

                        {/* Problem statement */}
                        <div>
                            <label style={LABEL}>Problem Statement</label>
                            <MarkdownEditor
                                value={statement}
                                onChange={setStatement}
                                placeholder="Write the full problem statement here. Supports **Markdown** and $\LaTeX$ math."
                                minHeight={260}
                                required
                            />
                        </div>

                        {/* Answer */}
                        <div>
                            <label style={LABEL}>Correct Answer</label>
                            <input
                                value={correctAnswer}
                                onChange={e => setCorrectAnswer(e.target.value)}
                                required
                                className="input"
                                style={{ width: '100%', fontFamily: MONO, fontSize: '14px' }}
                                placeholder="Exact answer string…"
                            />
                            <p style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink5)', marginTop: '6px' }}>
                                Submissions are compared case-insensitively with trimmed whitespace.
                            </p>
                        </div>

                        {/* Hint */}
                        <div>
                            <label style={LABEL}>Hint <span style={{ color: 'var(--ink5)', fontWeight: 400, letterSpacing: '0.05em' }}>(optional)</span></label>
                            <MarkdownEditor
                                value={hint}
                                onChange={setHint}
                                placeholder="Optional hint shown to users for half the XP…"
                                minHeight={120}
                            />
                            <p style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink5)', marginTop: '6px' }}>
                                Revealing the hint costs {Math.floor(points / 2)} XP (half of {points}). Leave empty for no hint.
                            </p>
                        </div>

                        {error && <p style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--rose)', margin: 0 }}>{error}</p>}
                        {success && <p style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--sage)', margin: 0 }}>{success}</p>}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <Link
                                href={`/admin/contests/${contestId}/edit`}
                                className="btn btn-ghost"
                                style={{ fontSize: '13px' }}
                            >
                                Cancel
                            </Link>
                            <button type="submit" className="btn btn-sage" disabled={saving}>
                                {saving ? 'Saving…' : 'Save Problem'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Danger Zone */}
                <div className="g" style={{ padding: '28px 36px', border: '1px solid rgba(184,96,78,0.22)', background: 'rgba(184,96,78,0.04)' }}>
                    <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontStyle: 'italic', color: 'var(--rose)', margin: '0 0 10px' }}>
                        Danger Zone
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--ink4)', marginBottom: '16px', fontWeight: 300 }}>
                        Deleting a problem is permanent and will remove all submissions for it.
                    </p>
                    {!confirmDelete ? (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            style={{ fontFamily: MONO, fontSize: '11px', letterSpacing: '0.06em', color: 'var(--rose)', background: 'rgba(184,96,78,0.10)', border: '1px solid rgba(184,96,78,0.25)', borderRadius: '7px', padding: '8px 18px', cursor: 'pointer' }}
                        >
                            Delete Problem
                        </button>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--rose)' }}>Are you sure? This cannot be undone.</span>
                            <button
                                onClick={deleteProblem}
                                disabled={deleting}
                                style={{ fontFamily: MONO, fontSize: '11px', color: '#fff', background: 'var(--rose)', border: 'none', borderRadius: '7px', padding: '8px 18px', cursor: 'pointer' }}
                            >
                                {deleting ? 'Deleting…' : 'Yes, Delete'}
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--ink4)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
