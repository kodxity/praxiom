<<<<<<< HEAD
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { AddProblemForm } from './AddProblemForm';
import { RegisterButton } from './RegisterButton';
import { ProblemsList } from './ProblemsList';

export default async function ContestPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    const contest = await prisma.contest.findUnique({
        where: { id: params.id },
        include: {
            problems: true,
            registrations: { where: { userId: session?.user?.id } }
        }
    });

    if (!contest) notFound();

    const isRegistered = contest.registrations.length > 0;

    const now = new Date();
    const isActive = now >= contest.startTime && now <= contest.endTime;
    const isPast = now > contest.endTime;
    const isUpcoming = now < contest.startTime;

    // Fetch user's submissions if logged in
    const submissions = session ? await prisma.submission.findMany({
        where: {
            userId: session.user.id,
            contestId: contest.id
        }
    }) : [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{contest.title}</h1>
                    <p className="text-muted-foreground whitespace-pre-line">{contest.description}</p>
                    <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                        <div>Start: {contest.startTime.toLocaleString()}</div>
                        <div>End: {contest.endTime.toLocaleString()}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' :
                                isPast ? 'bg-gray-100 text-gray-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                {isActive ? '🟢 Active' : isPast ? '⚫ Ended' : '🔵 Upcoming'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                    {session && !isPast && (
                        <RegisterButton contestId={contest.id} isRegistered={isRegistered} />
                    )}

                    <Link href={`/contests/${contest.id}/standings`} className="btn btn-outline">
                        View Standings
                    </Link>
                </div>
            </div>

            {/* Problems Section */}
            {contest.problems.length > 0 ? (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Problems</h2>
                    {session && isRegistered && isActive ? (
                        <ProblemsList
                            problems={contest.problems}
                            contestId={contest.id}
                            initialSubmissions={submissions}
                        />
                    ) : (
                        <div className="space-y-4">
                            {contest.problems.map((problem, idx) => (
                                <div key={problem.id} className="card">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold">Problem {String.fromCharCode(65 + idx)}: {problem.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{problem.points} points</p>
                                        </div>
                                    </div>
                                    {!session && (
                                        <p className="text-sm text-muted-foreground mt-4">Please log in to view problem details.</p>
                                    )}
                                    {session && !isRegistered && (
                                        <p className="text-sm text-muted-foreground mt-4">Please register for this contest to view problems.</p>
                                    )}
                                    {session && isRegistered && !isActive && (
                                        <p className="text-sm text-muted-foreground mt-4">
                                            {isUpcoming ? 'Contest has not started yet.' : 'Contest has ended.'}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    No problems added yet.
                </div>
            )}

            {/* Admin Area */}
            {session?.user?.isAdmin && (
                <div className="border-t pt-8">
                    <h2 className="text-xl font-bold mb-4">Admin Area</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold mb-2">Problems ({contest.problems.length})</h3>
                            <div className="space-y-2">
                                {contest.problems.map((p: any, i: number) => (
                                    <div key={p.id} className="p-3 border rounded bg-muted/30">
                                        <div className="font-medium">#{i + 1} {p.title}</div>
                                        <div className="text-sm text-muted-foreground mt-1">Answer: {p.correctAnswer} | Points: {p.points}</div>
                                    </div>
                                ))}
                                {contest.problems.length === 0 && <div className="text-muted-foreground italic">No problems added yet.</div>}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Add Problem</h3>
                            <AddProblemForm contestId={contest.id} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
=======
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
        const desc = contest.description ?? `Compete in ${contest.title} on Praxis.`;
        return {
            title: contest.title,
            description: desc,
            openGraph: {
                title: `${contest.title} | Praxis`,
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

    // Check if current user is registered (separate check to not affect count)
    let isRegistered = false;
    if (session?.user?.id) {
        try {
            const reg = await prisma.registration.findUnique({
                where: { userId_contestId: { userId: session.user.id, contestId: params.id } },
            });
            isRegistered = !!reg;
        } catch { /* ignore */ }
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
                isActive={isActive}
                isPast={isPast}
                isUpcoming={isUpcoming}
                isLoggedIn={!!session}
                isAdmin={session?.user?.isAdmin ?? false}
                contestType={contest.contestType}
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
                        {isUpcoming && !session?.user?.isAdmin ? (
                            <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--ink4)', fontFamily: 'var(--ff-mono)', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '28px' }}>🔒</div>
                                <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '18px', color: 'var(--ink)' }}>Problems Hidden</div>
                                <div>Problems will be revealed when the contest starts.</div>
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
                                            <div style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>#{i + 1} {p.title}</div>
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
>>>>>>> LATESTTHISONE-NEWMODES
