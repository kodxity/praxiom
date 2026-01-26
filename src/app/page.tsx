import { prisma } from '@/lib/db';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true, _count: { select: { comments: true } } }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Announcements</h1>
        {session?.user?.isAdmin && (
          <Link href="/admin/posts/new" className="btn btn-primary">
            New Announcement
          </Link>
        )}
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <div key={post.id} className="card hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-2">
              <Link href={`/posts/${post.id}`} className="hover:text-primary">
                {post.title}
              </Link>
            </h2>
            <div className="text-sm text-muted-foreground mb-4">
              By <span className="font-medium text-foreground">{post.author.username}</span> • {formatDate(post.createdAt)}
            </div>
            <p className="text-muted-foreground line-clamp-3 mb-4 whitespace-pre-line">
              {post.content}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link href={`/posts/${post.id}`} className="text-primary hover:underline">
                Read more
              </Link>
              <span className="text-muted-foreground">
                {post._count.comments} comments
              </span>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No announcements yet.
          </div>
        )}
      </div>
    </div>
  );
}
