'use client';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { MarkdownEditor } from '@/components/MarkdownEditor';

export default function NewBlogPostPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const res = await fetch('/api/posts', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(form)),
            headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
            const post = await res.json();
            router.push(`/posts/${post.id}`);
        }
    }

    if (status === 'loading') return null;

    if (!session) {
        return (
            <div style={{ maxWidth: '680px', margin: '0 auto', padding: '80px 1.75rem', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--ff-display)', fontSize: '24px', fontStyle: 'italic', color: 'var(--ink)', marginBottom: '12px' }}>
                    Sign in to write a post
                </p>
                <p style={{ fontSize: '14px', color: 'var(--ink4)', marginBottom: '24px' }}>You need an account to publish blog posts.</p>
                <Link href="/login" className="btn btn-ink">Sign In</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            {/* Header */}
            <div style={{ marginBottom: '36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Link href="/blog" style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textDecoration: 'none' }}>BLOG</Link>
                    <span style={{ color: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: '10px' }}>/</span>
                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--sage)' }}>NEW POST</span>
                </div>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.1 }}>
                    Write a Post
                </h1>
                <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--ink4)', marginTop: '8px', lineHeight: 1.6 }}>
                    Share a write-up, editorial, or anything math-related with the community.
                </p>
            </div>

            <form onSubmit={onSubmit}>
                <div className="g" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Title */}
                    <div>
                        <label style={{ display: 'block', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '8px' }}>Title</label>
                        <input
                            name="title"
                            placeholder="Post title…"
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
                            placeholder="Write your post here. Supports **Markdown** and $\LaTeX$ math."
                            minHeight={340}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
                        <Link href="/blog" className="btn btn-ghost">Cancel</Link>
                        <button type="submit" className="btn btn-sage">Publish Post →</button>
                    </div>
                </div>
            </form>
        </div>
    );
}
