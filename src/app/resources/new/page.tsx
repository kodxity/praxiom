'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { MarkdownEditor } from '@/components/MarkdownEditor';

export default function NewResourcePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [visibility, setVisibility] = useState<'PUBLIC' | 'SCHOOL_ONLY'>('PUBLIC');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        const form = new FormData(e.currentTarget);
        const res = await fetch('/api/resources', {
            method: 'POST',
            body: JSON.stringify({ title: form.get('title'), content: form.get('content'), visibility }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
            const resource = await res.json();
            router.push(`/resources/${resource.id}`);
        } else {
            const data = await res.json().catch(() => ({}));
            setError(data.error ?? 'Something went wrong. Please try again.');
            setSubmitting(false);
        }
    }

    if (status === 'loading') return null;

    if (!session) {
        return (
            <div style={{ maxWidth: '680px', margin: '0 auto', padding: '80px 1.75rem', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--ff-display)', fontSize: '24px', fontStyle: 'italic', color: 'var(--ink)', marginBottom: '12px' }}>
                    Sign in to create a resource
                </p>
                <p style={{ fontSize: '14px', color: 'var(--ink4)', marginBottom: '24px' }}>You need an account to publish resources.</p>
                <Link href="/login" className="btn btn-ink">Sign In</Link>
            </div>
        );
    }

    if (!session.user.isAdmin && !session.user.isTeacher) {
        return (
            <div style={{ maxWidth: '680px', margin: '0 auto', padding: '80px 1.75rem', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--ff-display)', fontSize: '24px', fontStyle: 'italic', color: 'var(--ink)', marginBottom: '12px' }}>
                    Access restricted
                </p>
                <p style={{ fontSize: '14px', color: 'var(--ink4)', marginBottom: '24px' }}>Only teachers and admins can create resources.</p>
                <Link href="/resources" className="btn btn-ink">Back to Resources</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            {/* Header */}
            <div style={{ marginBottom: '36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Link href="/resources" style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textDecoration: 'none' }}>RESOURCES</Link>
                    <span style={{ color: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: '10px' }}>/</span>
                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--sage)' }}>NEW</span>
                </div>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.1 }}>
                    New Resource
                </h1>
                <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--ink4)', marginTop: '8px', lineHeight: 1.6 }}>
                    Share a guide, problem set, or study material with your students or the community.
                </p>
            </div>

            <form onSubmit={onSubmit}>
                <div className="g" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Title */}
                    <div>
                        <label style={{ display: 'block', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '8px' }}>Title</label>
                        <input
                            name="title"
                            placeholder="Resource title…"
                            required
                            className="input"
                            style={{ width: '100%', fontFamily: 'var(--ff-display)', fontSize: '18px', fontStyle: 'italic' }}
                        />
                    </div>

                    {/* Visibility */}
                    <div>
                        <label style={{ display: 'block', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '8px' }}>Visibility</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {(['PUBLIC', 'SCHOOL_ONLY'] as const).map((v) => {
                                const active = visibility === v;
                                return (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setVisibility(v)}
                                        style={{
                                            fontFamily: 'var(--ff-mono)',
                                            fontSize: '11px',
                                            letterSpacing: '0.12em',
                                            padding: '8px 18px',
                                            borderRadius: 'var(--r)',
                                            border: active ? '1px solid var(--sage)' : '1px solid var(--border)',
                                            background: active ? 'rgba(107,148,120,0.12)' : 'transparent',
                                            color: active ? 'var(--sage)' : 'var(--ink4)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {v === 'PUBLIC' ? '🌍  Public' : '🏫  School Only'}
                                    </button>
                                );
                            })}
                        </div>
                        <p style={{ fontFamily: 'var(--ff-ui)', fontSize: '12px', color: 'var(--ink5)', marginTop: '8px' }}>
                            {visibility === 'PUBLIC'
                                ? 'Everyone can view this resource, including visitors.'
                                : 'Only students and teachers from your school can view this.'}
                        </p>
                    </div>

                    {/* Content */}
                    <div>
                        <label style={{ display: 'block', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '8px' }}>Content</label>
                        <MarkdownEditor
                            name="content"
                            placeholder="Write your resource here. Supports **Markdown** and $\LaTeX$ math."
                            minHeight={360}
                            required
                        />
                    </div>

                    {error && (
                        <p style={{ fontFamily: 'var(--ff-ui)', fontSize: '13px', color: 'var(--rose)', background: 'rgba(184,96,78,0.08)', border: '1px solid rgba(184,96,78,0.2)', borderRadius: 'var(--r)', padding: '10px 14px' }}>
                            {error}
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '4px' }}>
                        <Link href="/resources" className="btn" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink4)' }}>
                            Cancel
                        </Link>
                        <button type="submit" className="btn btn-sage" disabled={submitting}>
                            {submitting ? 'Publishing…' : 'Publish Resource'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
