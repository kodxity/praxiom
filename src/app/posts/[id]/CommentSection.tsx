'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CommentSection({ postId, initialComments }: { postId: string, initialComments: any[] }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [comment, setComment] = useState('');

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!comment.trim()) return;

        await fetch(`/api/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content: comment }),
            headers: { 'Content-Type': 'application/json' }
        });

        setComment('');
        router.refresh();
    }

    return (
        <div className="space-y-6">
            {session ? (
                <form onSubmit={onSubmit} className="space-y-2">
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className="input"
                        placeholder="Write a comment..."
                        rows={3}
                    />
                    <div className="flex justify-end">
                        <button className="btn btn-primary text-sm">Post Comment</button>
                    </div>
                </form>
            ) : (
                <div className="p-4 border rounded bg-muted/50 text-center text-sm">
                    Please log in to comment.
                </div>
            )}

            <div className="space-y-4">
                {initialComments.map((comment: any) => (
                    <div key={comment.id} className="p-4 border rounded-lg bg-card">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm text-primary">{comment.author.username}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
