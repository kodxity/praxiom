import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { AddProblemForm } from './AddProblemForm';
import { ProblemsList } from './ProblemsList';
import { ContestHero } from '@/components/ContestHero';
import { EndContestButton } from './EndContestButton';
import { TeamPanel } from './TeamPanel';
import { InvitesPanel } from './InvitesPanel';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata(
    props: { params: Promise<{ id: string }> },
): Promise<Metadata> {
    const { id } = await props.params;
    try {
        const contest = await prisma.contest.findUnique({
            where: { id },
            select: { title: true, description: true },
        });
        if (!contest) return { title: 'Contest Not Found' };
        const desc = contest.description ?? `Compete in ${contest.title} on Praxiom.`;
        return {
            title: contest.title,
            description: desc,
            openGraph: {
                title: `${contest.title} | Praxiom`,
                description: desc,
                url: `/contests/${id}`,
            },
            alternates: { canonical: `/contests/${id}` },
        };
    } catch {
        return { title: 'Contest' };
    }
}

export default async function ContestPage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const session = await getServerSession(authOptions);

    let contest: any = null;
    let submissions: any[] = [];

    try {
        contest = await prisma.contest.findUnique({
            where: { id: params.id },
            include: {
                problems: { orderBy: { id: 'asc' } },
                _count: { select: { registrations: true } },
            }
        });
    } catch {
        // DB unavailable in local frontend dev
    }

    if (contest === null && !['local', 'undefined'].includes(process.env.DATABASE_URL?.split('@')[1]?.split('/')[1] ?? '')) {
        notFound();
    }

    // If no DB at all, show a themed placeholder
    if (!contest) {
        return (
            <div className="container mx-auto px-6 py-16" style={{ maxWidth: '1280px' }}>
                <div className="text-center space-y-4" style={{ color: 'var(--theme-text-muted, #8a8274)' }}>
                    <h1 className="text-4xl" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--theme-text-primary)' }}>
                        Contest Preview
                    </h1>
                    <p>Connect a database to load contest data.</p>
                    <p className="text-sm">You&apos;re viewing this page in frontend-only mode.</p>
                </div>
            </div>
        );
    }

    let isRegistered = false;
    let hasStarted = false;
    let personalEndTime: Date | null = null;

    if (session?.user?.id && contest) {
        if (contest.contestType === 'individual') {
            try {
                const reg = await prisma.registration.findUnique({
                    where: { userId_contestId: { userId: session.user.id, contestId: params.id } },
                });
                if (reg) {
                    isRegistered = true;
                    if (reg.startTime) {
                        hasStarted = true;
                        personalEndTime = new Date(reg.startTime.getTime() + contest.duration * 60000);
                        if (personalEndTime > contest.endTime) personalEndTime = contest.endTime;
                    }
                }
            } catch { /* ignore */ }
        } else {
            try {
                const membership = await prisma.contestTeamMember.findFirst({
                    where: { userId: session.user.id, team: { contestId: params.id } },
                    include: { team: true }
                });
                if (membership) {
                    isRegistered = true;
                    if (membership.team.startTime) {
                        hasStarted = true;
                        personalEndTime = new Date(membership.team.startTime.getTime() + contest.duration * 60000);
                        if (personalEndTime > contest.endTime) personalEndTime = contest.endTime;
                    }
                }
            } catch { /* ignore */ }
        }
    }

    const now = new Date();
    const isActive = now >= contest.startTime && now <= contest.endTime;
    const isPast = now > contest.endTime;
    const isUpcoming = now < contest.startTime;

    try {
        if (session) {
            submissions = await prisma.submission.findMany({
                where: { userId: session.user.id, contestId: contest.id }
            });
        }
    } catch {
        // DB unavailable
    }

    // Compute locked problem IDs for sequential ordering (active contest + registered only)
    let lockedIds: string[] = [];
    if (isActive && isRegistered && session && contest.contestType === 'individual') {
        const solvedIds = new Set(
            submissions.filter((s: any) => s.isCorrect && !s.isUpsolve).map((s: any) => s.problemId)
        );
        const firstUnsolved = contest.problems.findIndex((p: any) => !solvedIds.has(p.id));
        if (firstUnsolved !== -1) {
            lockedIds = contest.problems.slice(firstUnsolved + 1).map((p: any) => p.id);
        }
    }

    const isTeamContest = contest.contestType === 'team' || contest.contestType === 'relay';
    const activeTab = searchParams.tab ?? 'problems';

    return (
        <div>
            {/* Contest Hero - themed, full-width */}
            <ContestHero
                contestId={contest.id}
                title={contest.title}
                description={contest.description}
                startTime={contest.startTime}
                endTime={contest.endTime}
                problemCount={contest.problems.length}
                participantCount={contest._count.registrations}
                isRegistered={isRegistered}
                hasStarted={hasStarted}
                personalEndTime={personalEndTime}
                isActive={isActive}
                isPast={isPast}
                isUpcoming={isUpcoming}
                isLoggedIn={!!session}
                isAdmin={session?.user?.isAdmin ?? false}
                contestType={contest.contestType}
                duration={contest.duration}
            />

            {/* Page body */}
            <div className="container" style={{ paddingTop: '36px', paddingBottom: '64px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* Tab nav for team/relay contests */}
                {isTeamContest && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[
                            { key: 'problems', label: 'Problems' },
                            { key: 'team', label: contest.contestType === 'relay' ? 'Relay Team' : 'Team' },
                            ...(session ? [{ key: 'invites', label: 'Invites' }] : []),
                        ].map(tab => (
                            <Link
                                key={tab.key}
                                href={`/contests/${contest.id}?tab=${tab.key}`}
                                style={{
                                    padding: '6px 16px', borderRadius: '8px', fontSize: '13px',
                                    fontFamily: 'var(--ff-mono)', textDecoration: 'none', letterSpacing: '0.04em',
                                    color: activeTab === tab.key ? 'var(--ink)' : 'var(--ink4)',
                                    background: activeTab === tab.key ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    border: activeTab === tab.key ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                                    transition: 'all 0.12s',
                                }}
                            >
                                {tab.label}
                            </Link>
                        ))}
                        <Link
                            href={`/contests/${contest.id}/standings`}
                            style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--ff-mono)', textDecoration: 'none', letterSpacing: '0.04em', color: 'var(--ink4)', border: '1px solid transparent' }}
                        >
                            Standings
                        </Link>
                    </div>
                )}

                {/* Problems Tab */}
                {(!isTeamContest || activeTab === 'problems') && (
                    <>
                        {(!hasStarted && !isPast && !session?.user?.isAdmin) ? (
                            <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--ink4)', fontFamily: 'var(--ff-mono)', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '28px' }}>🔒</div>
                                <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '18px', color: 'var(--ink)' }}>Problems Hidden</div>
                                <div>{isUpcoming ? 'Problems will be revealed when the contest starts.' : 'Click "Start Contest" to reveal the problems and start your timer.'}</div>
                            </div>
                        ) : contest.problems.length > 0 ? (
                            <div>
                                <h2
                                    style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '22px', color: 'var(--ink)', marginBottom: '14px' }}
                                >
                                    Problems
                                </h2>
                                <ProblemsList
                                    problems={contest.problems}
                                    contestId={contest.id}
                                    initialSubmissions={submissions}
                                    lockedIds={lockedIds}
                                />
                            </div>
                        ) : (
                            <div
                                style={{ textAlign: 'center', padding: '64px', color: 'var(--ink4)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}
                            >
                                No problems added yet.
                            </div>
                        )}
                    </>
                )}

                {/* Team Tab */}
                {isTeamContest && activeTab === 'team' && session && (
                    <TeamPanel
                        contestId={contest.id}
                        contestType={contest.contestType as 'team' | 'relay'}
                        currentUserId={session.user.id}
                        contestStarted={isActive || isPast}
                        contestEnded={isPast}
                    />
                )}
                {isTeamContest && activeTab === 'team' && !session && (
                    <div style={{ textAlign: 'center', padding: '64px', fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'var(--ink5)' }}>
                        <Link href="/login" style={{ color: 'var(--sage)' }}>Log in</Link> to join or create a team.
                    </div>
                )}

                {/* Invites Tab */}
                {isTeamContest && activeTab === 'invites' && session && (
                    <InvitesPanel
                        contestId={contest.id}
                        contestStarted={isActive || isPast}
                    />
                )}

{/* Admin Area */}
                {session?.user?.isAdmin && (
                    <div
                        className="g"
                        style={{ padding: '28px 32px' }}
                    >
                        <h2
                            style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '20px', color: 'var(--sage)', marginBottom: '24px' }}
                        >
                            Admin Area
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                            <div>
                                <h3 style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--ink)', marginBottom: '12px', letterSpacing: '0.02em' }}>
                                    Problems ({contest.problems.length})
                                    {contest.contestType === 'relay' && contest.problems.length !== 3 && (
                                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--rose)', marginLeft: '8px' }}>
                                            ⚠ Relay requires exactly 3 problems
                                        </span>
                                    )}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {contest.problems.map((p: any, i: number) => (
                                        <div
                                            key={p.id}
                                            style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--sage-bg)', border: '1px solid var(--sage-border)' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                                <div style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>#{i + 1} {p.title}</div>
                                                <Link
                                                    href={`/admin/contests/${contest.id}/problems/${p.id}/edit`}
                                                    style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--sage)', textDecoration: 'none', background: 'rgba(107,148,120,0.10)', border: '1px solid rgba(107,148,120,0.25)', padding: '4px 10px', borderRadius: '8px', whiteSpace: 'nowrap' }}
                                                >
                                                    Edit â†’
                                                </Link>
                                            </div>
                                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink4)', marginTop: '3px' }}>Answer: {p.correctAnswer} · {p.points} pts</div>
                                        </div>
                                    ))}
                                    {contest.problems.length === 0 && (
                                        <div style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--ink4)' }}>No problems added yet.</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--ink)', marginBottom: '12px', letterSpacing: '0.02em' }}>Add Problem</h3>
                                <AddProblemForm contestId={contest.id} />
                            </div>
                            <div>
                                <h3 style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--ink)', marginBottom: '8px', letterSpacing: '0.02em' }}>Manage</h3>
                                {isActive && <EndContestButton contestId={contest.id} />}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
