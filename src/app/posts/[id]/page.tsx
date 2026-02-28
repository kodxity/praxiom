import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CommentSection } from './CommentSection';
import { VoteButtons } from '@/components/VoteButtons';
import { MarkdownContent } from '@/components/MarkdownContent';
import Link from 'next/link';

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    let post: any = null;
    try {
        post = await prisma.blogPost.findUnique({
            where: { id: params.id },
            include: {
                author: true,
                comments: {
                    include: { author: true },
                    orderBy: { createdAt: 'desc' }
                },
                votes: true,
            }
        });
    } catch {
        // DB unavailable in local frontend dev
    }

    if (!post) notFound();

    const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const initials = post.author.username.slice(0, 2).toUpperCase();
    const words = post.content.split(/\s+/).length;
    const rt = `${Math.max(1, Math.round(words / 200))} min read`;
    const upvotes = post.votes.filter((v: any) => v.type === 'UP').length;
    const downvotes = post.votes.filter((v: any) => v.type === 'DOWN').length;
    const userVote = (post.votes.find((v: any) => v.userId === session?.user?.id)?.type ?? null) as 'UP' | 'DOWN' | null;

    return (
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            {/* Back link + admin actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <Link href="/blog" style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    ← Back to Blog
                </Link>
                {session?.user?.isAdmin && (
                    <Link
                        href={`/admin/posts/${params.id}/edit`}
                        style={{ fontFamily: 'var(--ff-ui)', fontSize: '12px', fontWeight: 500, color: 'var(--ink3)', textDecoration: 'none', padding: '6px 14px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'transparent', transition: 'all 0.15s' }}
                    >
                        Edit Post
                    </Link>
                )}
            </div>

            {/* Article card */}
            <article className="g" style={{ padding: '36px 40px', marginBottom: '24px' }}>

                {/* Header */}
                <h1 style={{ fontFamily: 'var(--ff-display)', fontWeight: 400, fontSize: 'clamp(24px, 4vw, 36px)', lineHeight: 1.12, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: '20px' }}>
                    {post.title}
                </h1>

                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                    {/* Avatar */}
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(107,148,120,0.15)', border: '1px solid rgba(107,148,120,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--sage)', fontWeight: 600,
                    }}>
                        {initials}
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 600, color: 'var(--ink2)' }}>
                            {post.author.username}
                        </div>
                        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>
                            {date} &middot; {rt}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <MarkdownContent content={post.content} />

                {/* Votes */}
                <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Was this helpful?</span>
                    <VoteButtons postId={post.id} initialUpvotes={upvotes} initialDownvotes={downvotes} initialUserVote={userVote} />
                </div>
            </article>

            {/* Comments */}
            <div className="g" style={{ padding: '28px 32px' }}>
                <h2 style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '20px', color: 'var(--ink)', marginBottom: '20px' }}>
                    Comments <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)', fontStyle: 'normal' }}>({post.comments.length})</span>
                </h2>
                <CommentSection postId={post.id} initialComments={post.comments} />
            </div>

        </div>
    );
}

