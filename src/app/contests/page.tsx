import { prisma } from '@/lib/db'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ContestCard } from '@/components/ContestCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Contests',
    description:
        'Browse upcoming, active, and past math contests on Praxis. Register to compete and push your problem-solving skills to the limit.',
    openGraph: {
        title: 'Math Contests | Praxis',
        description: 'Browse and register for AMC-style math contests. Compete live, solve problems, and earn rating.',
        url: '/contests',
    },
    alternates: { canonical: '/contests' },
}

export const dynamic = 'force-dynamic'

export default async function ContestsPage() {
    const session = await getServerSession(authOptions)
    const now = new Date()

    let upcomingContests: any[] = []
    let activeContests: any[] = []
    let pastContests: any[] = []

    try {
        ;[upcomingContests, activeContests, pastContests] = await Promise.all([
            prisma.contest.findMany({
                where: { startTime: { gt: now } },
                orderBy: { startTime: 'asc' },
                include: { _count: { select: { registrations: true, problems: true } } },
            }),
            prisma.contest.findMany({
                where: { startTime: { lte: now }, endTime: { gte: now } },
                orderBy: { endTime: 'asc' },
                include: { _count: { select: { registrations: true, problems: true } } },
            }),
            prisma.contest.findMany({
                where: { endTime: { lt: now } },
                orderBy: { endTime: 'desc' },
                take: 10,
                include: { _count: { select: { registrations: true, problems: true } } },
            }),
        ])
    } catch {
        // DB unavailable in local frontend dev
    }

    const isAdmin = session?.user?.isAdmin || false
    const hasAny = activeContests.length + upcomingContests.length + pastContests.length > 0

    // Fetch which contests this user is registered for
    let registeredIds = new Set<string>()
    if (session?.user?.id) {
        try {
            const regs = await prisma.registration.findMany({
                where: { userId: session.user.id },
                select: { contestId: true },
            })
            registeredIds = new Set(regs.map((r: any) => r.contestId))
        } catch { /* ignore */ }
    }

    return (
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1360px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            {/* Page header */}
            <div className="g page-hd fade-in" style={{ marginBottom: '48px', padding: '36px 40px', maxWidth: '700px', position: 'relative' }}>
                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '28px', height: '1px', background: 'var(--sage)', opacity: 0.6, display: 'inline-block' }} />
                    PRAXIS &middot; CONTEST ARENA
                </p>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '12px', color: 'var(--ink)' }}>
                    Enter a World.<br />
                    <em style={{ fontStyle: 'italic', color: 'var(--sage)' }}>Solve the Problems.</em>
                </h1>
                <p style={{ fontSize: '16px', fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.65 }}>
                    Each contest is a distinct visual world  different theme, atmosphere, and story. Earn your place on the leaderboard.
                </p>
                {isAdmin && (
                    <Link href="/admin/contests/new" className="btn btn-ghost btn-sm" style={{ marginTop: '20px', display: 'inline-flex' }}>
                        + Create Contest
                    </Link>
                )}
            </div>

            {/* Empty state */}
            {!hasAny && (
                <div className="g" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="empty">
                        <div style={{ width: '100px', height: '70px', border: '2px dashed rgba(184,96,78,0.25)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(184,96,78,0.4)', textAlign: 'center' }}> DOODLE</span>
                        </div>
                        <div className="empty-title">No live contests</div>
                        <div className="empty-body">New worlds are being built. Check back soon  the next arc begins shortly.</div>
                        <Link href="/" className="btn btn-ghost btn-sm" style={{ marginTop: '4px' }}>Back to Home</Link>
                    </div>
                </div>
            )}

            {/* Live Now */}
            {activeContests.length > 0 && (
                <section style={{ marginBottom: '48px' }}>
                    <p className="sec-label">Live Now</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        {activeContests.map((c: any, i: number) => (
                            <ContestCard key={c.id} contest={c} active isAdmin={isAdmin} animDelay={i * 0.08} isRegistered={registeredIds.has(c.id)} />
                        ))}
                    </div>
                </section>
            )}

            {/* Upcoming */}
            {upcomingContests.length > 0 && (
                <section style={{ marginBottom: '48px' }}>
                    <p className="sec-label">Upcoming</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        {upcomingContests.map((c: any, i: number) => (
                            <ContestCard key={c.id} contest={c} isAdmin={isAdmin} animDelay={i * 0.08} isRegistered={registeredIds.has(c.id)} />
                        ))}
                    </div>
                </section>
            )}

            {/* Past Contests */}
            {pastContests.length > 0 && (
                <section>
                    <p className="sec-label">Past Contests</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        {pastContests.map((c: any, i: number) => (
                            <ContestCard key={c.id} contest={c} past isAdmin={isAdmin} animDelay={i * 0.06} isRegistered={registeredIds.has(c.id)} />
                        ))}
                    </div>
                </section>
            )}

        </div>
    )
}
