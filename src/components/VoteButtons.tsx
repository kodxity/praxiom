'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface Props {
    postId: string;
    initialUpvotes: number;
    initialDownvotes: number;
    initialUserVote: 'UP' | 'DOWN' | null;
    size?: 'sm' | 'md';
}

export function VoteButtons({ postId, initialUpvotes, initialDownvotes, initialUserVote, size = 'md' }: Props) {
    const { data: session } = useSession();
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [downvotes, setDownvotes] = useState(initialDownvotes);
    const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(initialUserVote);
    const [loading, setLoading] = useState(false);

    const iconSize = size === 'sm' ? 13 : 15;
    const fontSize = size === 'sm' ? '11px' : '12px';
    const padding = size === 'sm' ? '4px 8px' : '5px 12px';

    async function vote(type: 'UP' | 'DOWN') {
        if (!session?.user?.id || loading) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/posts/${postId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type }),
            });
            if (res.ok) {
                const data = await res.json();
                setUpvotes(data.upvotes);
                setDownvotes(data.downvotes);
                setUserVote(data.userVote);
            }
        } finally {
            setLoading(false);
        }
    }

    const upActive = userVote === 'UP';
    const downActive = userVote === 'DOWN';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
                onClick={() => vote('UP')}
                disabled={!session?.user?.id || loading}
                title={session?.user?.id ? 'Upvote' : 'Log in to vote'}
                style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding, borderRadius: '8px', border: 'none', cursor: session?.user?.id ? 'pointer' : 'default',
                    fontFamily: 'var(--ff-mono)', fontSize, fontWeight: 600,
                    background: upActive ? 'rgba(107,148,120,0.15)' : 'rgba(0,0,0,0.04)',
                    color: upActive ? 'var(--sage)' : 'var(--ink4)',
                    transition: 'all 0.15s',
                    opacity: loading ? 0.6 : 1,
                }}
            >
                <ThumbsUp size={iconSize} />
                {upvotes}
            </button>
            <button
                onClick={() => vote('DOWN')}
                disabled={!session?.user?.id || loading}
                title={session?.user?.id ? 'Downvote' : 'Log in to vote'}
                style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding, borderRadius: '8px', border: 'none', cursor: session?.user?.id ? 'pointer' : 'default',
                    fontFamily: 'var(--ff-mono)', fontSize, fontWeight: 600,
                    background: downActive ? 'rgba(184,96,78,0.12)' : 'rgba(0,0,0,0.04)',
                    color: downActive ? 'var(--rose)' : 'var(--ink4)',
                    transition: 'all 0.15s',
                    opacity: loading ? 0.6 : 1,
                }}
            >
                <ThumbsDown size={iconSize} />
                {downvotes}
            </button>
        </div>
    );
}
