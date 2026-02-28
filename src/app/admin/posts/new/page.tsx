'use client';
import { useRouter } from 'next/navigation';
import { MarkdownEditor } from '@/components/MarkdownEditor';

export default function NewPostPage() {
    const router = useRouter();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);

        const data = Object.fromEntries(form);
        const res = await fetch('/api/posts', {
            method: 'POST',
            body: JSON.stringify({ ...data, isAnnouncement: true }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            router.push('/');
            router.refresh();
        }
    }

    return (
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            {/* Header */}
            <div style={{ marginBottom: '36px' }}>
                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '10px' }}>ADMIN · NEW POST</p>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.1, marginBottom: '8px' }}>
                    Create Announcement
                </h1>
                <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--ink4)', lineHeight: 1.6 }}>
                    Announcements are shown on the home page for all users.
                </p>
            </div>

            <form onSubmit={onSubmit}>
                <div className="g" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Title */}
                    <div>
                        <label style={{ display: 'block', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '8px' }}>Title</label>
                        <input
                            name="title"
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
                            placeholder="Write the announcement body. Supports **Markdown** and $\LaTeX$ math."
                            minHeight={280}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
                        <a href="/" className="btn btn-ghost">Cancel</a>
                        <button type="submit" className="btn btn-ink">Publish Announcement</button>
                    </div>
                </div>
            </form>
        </div>
    )
}
