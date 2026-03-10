import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { ProblemsClient } from '@/components/ProblemsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Problem Archive',
    description:
        'Browse and solve hundreds of math contest problems from Praxis competitions. Filter by difficulty — Easy, Medium, Hard, and Expert.',
    openGraph: {
        title: 'Problem Archive | Praxis',
        description: 'Hundreds of AMC-style math problems to solve. Filter by difficulty and track your progress.',
        url: '/problems',
    },
    alternates: { canonical: '/problems' },
}

export const dynamic = 'force-dynamic'

export default async function ProblemsPage() {
  const session = await getServerSession(authOptions)

  let problems: {
    id: string
    title: string
    points: number
    contestId: string
    contest: { id: string; title: string }
    _count: { submissions: number }
  }[] = []

  let solvedIds = new Set<string>()
  let totalUsers = 0

  try {
    ;[problems, totalUsers] = await Promise.all([
      prisma.problem.findMany({
        include: {
          contest: { select: { id: true, title: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { points: 'asc' },
      }),
      prisma.user.count(),
    ])

    if (session?.user?.id) {
      const solved = await prisma.submission.findMany({
        where: { userId: session.user.id, isCorrect: true },
        select: { problemId: true },
        distinct: ['problemId'],
      })
      solvedIds = new Set(solved.map((s) => s.problemId))
    }
  } catch {
    // DB unavailable
  }

  const easyCount   = problems.filter((p) => p.points <= 80).length
  const medCount    = problems.filter((p) => p.points > 80 && p.points <= 120).length
  const hardCount   = problems.filter((p) => p.points > 120 && p.points <= 200).length
  const expertCount = problems.filter((p) => p.points > 200).length
  const solvedCount = problems.filter((p) => solvedIds.has(p.id)).length

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

      {/* Page header */}
      <div className="g page-hd fade-in" style={{ marginBottom: '36px', padding: '36px 40px', maxWidth: '680px' }}>
        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '28px', height: '1px', background: 'var(--sage)', opacity: 0.6, display: 'inline-block' }} />
          PRAXIS &middot; PROBLEM ARCHIVE
        </p>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: '12px', color: 'var(--ink)' }}>
          The Problem <em style={{ fontStyle: 'italic', color: 'var(--sage)' }}>Archive.</em>
        </h1>
        <p style={{ fontSize: '15px', fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.65 }}>
          Every problem ever posed in Praxis contests. Practice freely - submissions here don&apos;t affect your rating.
        </p>
      </div>

      {/* Stats row */}
      {problems.length > 0 && (
        <div className="fade-in-d" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {session && (
            <div className="g" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '26px', color: 'var(--sage)' }}>{solvedCount}</span>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ink4)', textTransform: 'uppercase' }}>Solved by you</span>
            </div>
          )}
          <div className="g" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '26px', color: 'var(--ink)' }}>{problems.length}</span>
            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ink4)', textTransform: 'uppercase' }}>Total Problems</span>
          </div>
          <div className="g" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {easyCount > 0   && <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--sage)' }}>{easyCount}E</span>}
            {medCount > 0    && <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--amber)' }}>{medCount}M</span>}
            {hardCount > 0   && <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--rose)' }}>{hardCount}H</span>}
            {expertCount > 0 && <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--violet)' }}>{expertCount}X</span>}
            {/* legend */}
            <span style={{ width: '1px', height: '14px', background: 'var(--border)', margin: '0 2px', flexShrink: 0 }} />
            {[
              { cls: 'diff-e', label: 'Easy' },
              { cls: 'diff-m', label: 'Med' },
              { cls: 'diff-h', label: 'Hard' },
              { cls: 'diff-x', label: 'Expert' },
            ].map(({ cls, label }) => (
              <span key={cls} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className={`diff-dot ${cls}`} />
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', color: 'var(--ink5)', letterSpacing: '0.06em' }}>{label}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Problem list */}
      {problems.length === 0 ? (
        <div className="g" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="empty">
            <div style={{ width: '90px', height: '64px', border: '2px dashed rgba(107,148,120,0.25)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(107,148,120,0.4)', textAlign: 'center' }}>EMPTY</span>
            </div>
            <div className="empty-title">No problems yet</div>
            <div className="empty-body">Problems will appear here once contests are created and problems are added.</div>
            <Link href="/contests" className="btn btn-ghost btn-sm" style={{ marginTop: '4px' }}>Browse Contests</Link>
          </div>
        </div>
      ) : (
        <ProblemsClient problems={problems} solvedIds={[...solvedIds]} />
      )}

    </div>
  )
}
