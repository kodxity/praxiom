'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MarkdownEditor } from '@/components/MarkdownEditor';

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`/api/posts/${params.id}`)
            .then(r => r.json())
            .then(data => {
                setTitle(data.title ?? '');
                setContent(data.content ?? '');
                setLoading(false);
            })
            .catch(() => setError('Failed to load post.'));
    }, [params.id]);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setError('');
        const form = new FormData(e.currentTarget);
        const res = await fetch(`/api/posts/${params.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ title: form.get('title'), content: form.get('content'), isAnnouncement: true }),
            headers: { 'Content-Type': 'application/json' },
        });
        setSaving(false);
        if (res.ok) {
            router.push('/');
            router.refresh();
        } else {
            setError('Failed to save changes.');
        }
    }

    async function handleDelete() {
        if (!confirmDelete) { setConfirmDelete(true); return; }
        setDeleting(true);
        const res = await fetch(`/api/posts/${params.id}`, { method: 'DELETE' });
        setDeleting(false);
        if (res.ok) {
            router.push('/');
            router.refresh();
        } else {
            setError('Failed to delete post.');
        }
    }

    if (loading) {
        return (
            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 1.75rem', textAlign: 'center', fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink5)' }}>
                Loading…
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            {/* Header */}
            <div style={{ marginBottom: '36px' }}>
                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '10px' }}>ADMIN · EDIT POST</p>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.1, marginBottom: '8px' }}>
                    Edit Announcement
                </h1>
            </div>

            {error && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: 'var(--r)', background: 'rgba(184,96,78,0.08)', border: '1px solid rgba(184,96,78,0.2)', color: 'var(--rose)', fontFamily: 'var(--ff-ui)', fontSize: '14px' }}>
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit}>
                <div className="g" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Title */}
                    <div>
                        <label style={{ display: 'block', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '8px' }}>Title</label>
                        <input
                            name="title"
                            defaultValue={title}
                            placeholder="Announcement title…"
                            required
                            className="input"
                            style={{ width: '100%', fontFamily: 'var(--ff-display)', fontSize: '18px', fontStyle: 'italic' }}
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label style={{ display: 'block', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '8px' }}>Content</label>
                        <MarkdownEditor
                            name="content"
                            defaultValue={content}
                            placeholder="Write the announcement body. Supports **Markdown** and $\LaTeX$ math."
                            minHeight={280}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                        {/* Danger zone */}
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{
                                fontFamily: 'var(--ff-ui)', fontSize: '13px', padding: '8px 14px', borderRadius: 'var(--r)',
                                background: confirmDelete ? 'rgba(184,96,78,0.12)' : 'transparent',
                                border: `1px solid ${confirmDelete ? 'rgba(184,96,78,0.3)' : 'rgba(184,96,78,0.15)'}`,
                                color: 'var(--rose)', cursor: 'pointer', transition: 'all 0.15s',
                                opacity: deleting ? 0.6 : 1,
                            }}
                        >
                            {deleting ? 'Deleting…' : confirmDelete ? 'Confirm Delete' : 'Delete Post'}
                        </button>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <a href="/" className="btn btn-ghost">Cancel</a>
                            <button type="submit" disabled={saving} className="btn btn-ink" style={{ opacity: saving ? 0.65 : 1 }}>
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
