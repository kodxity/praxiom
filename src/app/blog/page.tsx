import { prisma } from '@/lib/db';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const session = await getServerSession(authOptions);
  let posts: any[] = [];
  let announcements: any[] = [];

  try {
    [announcements, posts] = await Promise.all([
      prisma.blogPost.findMany({
        where: { isAnnouncement: true },
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { username: true, isAdmin: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.blogPost.findMany({
        where: { isAnnouncement: false },
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { username: true, isAdmin: true } },
          _count: { select: { comments: true } },
        },
      }),
    ]);
  } catch { /* DB unavailable */ }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 1.75rem 80px', position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '10px' }}>COMMUNITY</p>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.1 }}>
            Blog
          </h1>
          <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--ink4)', marginTop: '8px' }}>
            Write-ups, editorials, and thoughts from the community.
          </p>
        </div>
        {session?.user?.id && (
          <Link href="/blog/new" className="btn btn-sage">
            + Write a Post
          </Link>
        )}
      </div>

      {/* Pinned Announcements */}
      {announcements.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--sage)', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '16px', height: '1px', background: 'var(--sage)', opacity: 0.6, display: 'inline-block' }} />
            Announcements
          </p>
          <div>
            {announcements.map((post: any, i: number) => {
              const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              return (
                <div key={post.id} className="blog-announce-row fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  <Link href={`/posts/${post.id}`} style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.25, marginBottom: '4px' }}>
                        {post.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--ff-ui)', fontSize: '12px', color: 'var(--ink4)' }}>{post.author.username}</span>
                        <span className="tag tag-sage" style={{ fontSize: '9px' }}>Admin</span>
                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>{post._count.comments} comment{post._count.comments !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </Link>
                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)', whiteSpace: 'nowrap', flexShrink: 0 }}>{date}</span>
                  {session?.user?.isAdmin && (
                    <Link href={`/admin/posts/${post.id}/edit`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', textDecoration: 'none', padding: '4px 9px', borderRadius: '6px', border: '1px solid var(--border)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      Edit
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Blog post cards */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--ink5)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '16px', height: '1px', background: 'var(--ink5)', opacity: 0.4, display: 'inline-block' }} />
          Community Posts
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="g" style={{ overflow: 'hidden' }}>
          <div className="empty">
            <div style={{ width: '100px', height: '70px', border: '2px dashed rgba(184,96,78,.25)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
              <BookOpen style={{ width: '28px', height: '28px', opacity: 0.25, color: 'var(--rose)' }} />
            </div>
            <div className="empty-title">No blog posts yet</div>
            <div className="empty-body">Be the first - share a write-up, editorial, or insight.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {posts.map((post: any, i: number) => {
            const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const stripped = post.content
              .replace(/^#{1,6}\s+/gm, '')
              .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
              .replace(/_([^_]+)_/g, '$1')
              .replace(/`[^`]+`/g, (m: string) => m.slice(1, -1))
              .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
              .replace(/^>+\s*/gm, '')
              .replace(/^[-*+]\s+/gm, '')
              .replace(/^\d+\.\s+/gm, '')
              .replace(/\n+/g, ' ').trim();
            const excerpt = stripped.length > 180 ? stripped.slice(0, 180).trimEnd() + '…' : stripped;
            const initials = (post.author.username?.[0] ?? '?').toUpperCase();
            return (
              <div
                key={post.id}
                className="g blog-card fade-in"
                style={{ padding: '24px 26px', animationDelay: `${i * 0.05}s`, display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--sage-bg), var(--slate-bg))', border: '1.5px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-ui)', fontSize: '10px', fontWeight: 700, color: 'var(--ink2)', flexShrink: 0 }}>
                    {initials}
                  </div>
                  <span style={{ fontFamily: 'var(--ff-ui)', fontSize: '12px', color: 'var(--ink3)' }}>{post.author.username}</span>
                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', marginLeft: 'auto' }}>{date}</span>
                </div>
                <Link href={`/posts/${post.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ fontFamily: 'var(--ff-display)', fontSize: '19px', fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.25, marginBottom: '10px' }}>
                    {post.title}
                  </div>
                </Link>
                <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.65, marginBottom: '16px', flex: 1 }}>
                  {excerpt}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>
                    {post._count.comments} comment{post._count.comments !== 1 ? 's' : ''}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {session?.user?.isAdmin && (
                      <Link href={`/admin/posts/${post.id}/edit`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', letterSpacing: '0.06em', textDecoration: 'none', padding: '3px 8px', borderRadius: '5px', border: '1px solid var(--border)' }}>
                        Edit
                      </Link>
                    )}
                    <Link href={`/posts/${post.id}`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--sage)', letterSpacing: '0.06em', textDecoration: 'none' }}>Read →</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
