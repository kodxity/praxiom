'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CommentSection({ postId, initialComments }: { postId: string, initialComments: any[] }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!comment.trim()) return;
        setSubmitting(true);
        await fetch(`/api/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content: comment }),
            headers: { 'Content-Type': 'application/json' }
        });
        setComment('');
        setSubmitting(false);
        router.refresh();
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Input form */}
            {session ? (
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className="input"
                        placeholder="Share your thoughts…"
                        rows={3}
                        style={{ resize: 'vertical', lineHeight: 1.6 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="btn btn-ink btn-sm"
                            disabled={submitting || !comment.trim()}
                            style={{ opacity: (submitting || !comment.trim()) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            {submitting && <span className="spin" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />}
                            Post Comment
                        </button>
                    </div>
                </form>
            ) : (
                <div style={{
                    padding: '16px 20px', borderRadius: 'var(--r)',
                    background: 'rgba(0,0,0,0.025)', border: '1px solid var(--border)',
                    fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink5)', textAlign: 'center',
                }}>
                    Log in to leave a comment.
                </div>
            )}

            {/* Comment list */}
            {initialComments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {initialComments.map((c: any) => {
                        const initials = c.author.username.slice(0, 2).toUpperCase();
                        const date = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        return (
                            <div key={c.id} style={{
                                display: 'flex', gap: '12px', padding: '14px 16px',
                                borderRadius: 'var(--r)',
                                background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)',
                                animation: 'fade-in 0.3s both',
                            }}>
                                {/* Avatar */}
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                    background: 'rgba(107,148,120,0.13)', border: '1px solid rgba(107,148,120,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--sage)', fontWeight: 600,
                                    marginTop: '1px',
                                }}>
                                    {initials}
                                </div>
                                {/* Body */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <span style={{ fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 600, color: 'var(--ink2)' }}>
                                            {c.author.username}
                                        </span>
                                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>
                                            {date}
                                        </span>
                                    </div>
                                    <p style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', color: 'var(--ink3)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {c.content}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {initialComments.length === 0 && (
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink5)', textAlign: 'center', padding: '20px 0' }}>
                    No comments yet. Be the first to share your thoughts.
                </div>
            )}
        </div>
    );
}

