import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { CommentSection } from './CommentSection';

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const post = await prisma.blogPost.findUnique({
        where: { id: params.id },
        include: {
            author: true,
            comments: {
                include: { author: true },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!post) notFound();

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <article className="card">
                <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                <div className="flex items-center text-sm text-muted-foreground mb-6">
                    <span>By {post.author.username}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-line">
                    {post.content}
                </div>
            </article>

            <div className="space-y-4">
                <h3 className="text-xl font-bold">Comments</h3>
                <CommentSection postId={post.id} initialComments={post.comments} />
            </div>
        </div>
    );
}
