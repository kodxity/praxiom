import { prisma } from '@/lib/db';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookOpen, Swords, Map, Trophy, Zap } from 'lucide-react';
import { VoteButtons } from '@/components/VoteButtons';
import { MarkdownContent } from '@/components/MarkdownContent';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  let posts: any[] = [];
  let problemCount = 248;
  let userCount = 0;
  let contestCount = 0;

  try {
    [posts, problemCount, userCount, contestCount] = await Promise.all([
      prisma.blogPost.findMany({
        where: { isAnnouncement: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          author: true,
          _count: { select: { comments: true, votes: true } },
          votes: true,
        },
      }),
      prisma.problem.count(),
      prisma.user.count(),
      prisma.contest.count(),
    ]) as any;
  } catch {
    // DB unavailable in local dev  use defaults
  }

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>

      {/*  Section A: Hero  */}
      <section style={{ padding: '56px 1.75rem 64px', maxWidth: '1360px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Hero card */}
          <div className="g fade-in" style={{ padding: '52px 52px', maxWidth: '820px', flex: '1 1 480px', position: 'relative', overflow: 'hidden' }}>
            {/* Radial glow */}
            <div aria-hidden="true" style={{ position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px', background: 'radial-gradient(circle,rgba(107,148,120,.14),transparent 68%)', borderRadius: '50%', pointerEvents: 'none', animation: 'glow-pulse 6s ease-in-out infinite' }} />

            <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.25em', color: 'var(--sage)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '28px', height: '1px', background: 'var(--sage)', opacity: 0.6, display: 'inline-block', flexShrink: 0 }} />
              COMPETITION MATHEMATICS &middot; PRAXIS
            </p>

            <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(40px,5.5vw,64px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px', color: 'var(--ink)' }}>
              Sharpen Your Skills for<br />
              <em style={{ fontStyle: 'italic', color: 'var(--sage)' }}>Math Competitions.</em>
            </h1>

            <p style={{ fontSize: '17px', fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '440px' }}>
              Real competition problems. Themed contests. Ranked progression. Build problem-solving intuition that lasts  one contest at a time.
            </p>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/contests" className="btn btn-ink btn-lg">
                Enter the Arena
              </Link>
              <Link href="/register" className="btn btn-glass btn-lg">
                Create Account
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
            <div className="g fade-in-d" style={{ padding: '22px 24px' }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontSize: '34px', color: 'var(--ink)', lineHeight: 1, marginBottom: '4px', animation: 'count-up 0.6s ease 0.3s both' }}>{problemCount || ''}</div>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase' }}>Problems in vault</div>
            </div>
            <div className="g fade-in-d2" style={{ padding: '22px 24px' }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontSize: '34px', color: 'var(--ink)', lineHeight: 1, marginBottom: '4px', animation: 'count-up 0.6s ease 0.45s both' }}>{userCount > 0 ? userCount.toLocaleString() : ''}</div>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase' }}>Registered solvers</div>
            </div>
            <div className="g fade-in-d3" style={{ padding: '22px 24px' }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontSize: '34px', color: 'var(--ink)', lineHeight: 1, marginBottom: '4px', animation: 'count-up 0.6s ease 0.6s both' }}>{contestCount > 0 ? contestCount : ''}</div>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '10px' }}>Contests hosted</div>
              <div className="prog-bar-wrap" style={{ height: '5px' }}>
                <div className="prog-fill prog-sage" style={{ width: contestCount > 0 ? `${Math.min((contestCount / 20) * 100, 100)}%` : '12%', height: '5px', transition: 'width 1s ease 0.8s' }} />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/*  Section B: Platform highlights  */}
      <section style={{ padding: '0 1.75rem 72px', maxWidth: '1360px', margin: '0 auto' }} className="fade-in-d2">
        <p className="sec-label" style={{ marginBottom: '24px' }}>How it works</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>

          {[
            { icon: <Swords size={22} style={{ color: 'var(--sage)' }} />, title: 'Compete in Contests', body: 'Enter themed contests  each one a distinct visual world with its own atmosphere, story, and leaderboard. New contests run regularly.' },
            { icon: <Map size={22} style={{ color: 'var(--slate)' }} />, title: 'Solve Real Problems', body: 'Work through competition-style math problems across all topics. Each problem unlocks a lore fragment when solved correctly.' },
            { icon: <Trophy size={22} style={{ color: 'var(--amber)' }} />, title: 'Climb the Rankings', body: 'Your rating updates after every contest. Beat strong competitors to earn rank badges from Initiate all the way to Archon.' },
            { icon: <Zap size={22} style={{ color: 'var(--violet)' }} />, title: 'Earn XP & Hints', body: 'Spend XP on hints when you are stuck. Earn it back by solving problems quickly and correctly. Manage your resources wisely.' },
          ].map((feat, i) => (
            <div
              key={i}
              className="g fade-in"
              style={{ padding: '28px 28px', flex: '1 1 220px', maxWidth: '300px', animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div style={{ marginBottom: '14px' }}>{feat.icon}</div>
              <div style={{ fontFamily: 'var(--ff-display)', fontSize: '19px', color: 'var(--ink)', marginBottom: '8px', lineHeight: 1.2 }}>{feat.title}</div>
              <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.65 }}>{feat.body}</p>
            </div>
          ))}

        </div>
      </section>

      {/*  Section C: Announcements feed  */}
      <section style={{ padding: '0 1.75rem 80px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }} className="fade-in-d3">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <p className="sec-label" style={{ marginBottom: 0 }}>Announcements</p>
            {session?.user?.isAdmin && (
              <Link href="/admin/posts/new" className="btn btn-ghost btn-sm">+ New</Link>
            )}
          </div>
          <Link href="/blog" className="btn btn-ghost btn-sm">Blog →</Link>
        </div>

        <div>
          {posts.map((post: any, i: number) => {
            const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const initials = (post.author.username?.[0] ?? 'A').toUpperCase();
            const upvotes = post.votes.filter((v: any) => v.type === 'UP').length;
            const downvotes = post.votes.filter((v: any) => v.type === 'DOWN').length;
            const userVote = (post.votes.find((v: any) => v.userId === session?.user?.id)?.type ?? null) as 'UP' | 'DOWN' | null;
            return (
              <div
                key={post.id}
                className="fade-in"
                style={{
                  paddingBottom: '36px',
                  marginBottom: '36px',
                  borderBottom: i < posts.length - 1 ? '1px solid var(--glass-border)' : 'none',
                  animationDelay: `${0.3 + i * 0.05}s`,
                }}
              >
                {/* Post header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--sage-bg), var(--slate-bg))', border: '1.5px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-ui)', fontSize: '10px', fontWeight: 700, color: 'var(--ink2)', flexShrink: 0 }}>
                    {initials}
                  </div>
                  <span style={{ fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 600, color: 'var(--ink2)' }}>{post.author.username}</span>
                  {post.author.isAdmin && (
                    <span className="tag tag-sage" style={{ fontSize: '9px', letterSpacing: '0.08em' }}>Admin</span>
                  )}
                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)', marginLeft: 'auto' }}>{date}</span>
                </div>

                {/* Title */}
                <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(20px,2.8vw,28px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.2, marginBottom: '12px' }}>
                  {post.title}
                </h2>

                {/* Full content */}
                <MarkdownContent content={post.content} style={{ fontSize: '15px', marginBottom: '20px' }} />

                {/* Footer: votes + comment count + read link */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '14px', borderTop: '1px solid var(--glass-border)' }}>
                  <VoteButtons postId={post.id} initialUpvotes={upvotes} initialDownvotes={downvotes} initialUserVote={userVote} size="sm" />
                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>
                    {post._count.comments} comment{post._count.comments !== 1 ? 's' : ''}
                  </span>
                  <Link href={`/posts/${post.id}`} style={{ marginLeft: 'auto', fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--sage)', letterSpacing: '0.06em', textDecoration: 'none' }}>
                    Read full post →
                  </Link>
                  {session?.user?.isAdmin && (
                    <Link href={`/admin/posts/${post.id}/edit`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', letterSpacing: '0.06em', textDecoration: 'none', padding: '4px 9px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            );
          })}

          {posts.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: '40px' }} className="fade-in-d3">
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)', letterSpacing: '0.08em' }}>No announcements yet</div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
