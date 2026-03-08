import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { AddProblemForm } from './AddProblemForm';
import { ProblemsList } from './ProblemsList';
import { ContestHero } from '@/components/ContestHero';
import { EndContestButton } from './EndContestButton';


export default async function ContestPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
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
    if (isActive && isRegistered && session) {
        const solvedIds = new Set(
            submissions.filter((s: any) => s.isCorrect && !s.isUpsolve).map((s: any) => s.problemId)
        );
        const firstUnsolved = contest.problems.findIndex((p: any) => !solvedIds.has(p.id));
        if (firstUnsolved !== -1) {
            lockedIds = contest.problems.slice(firstUnsolved + 1).map((p: any) => p.id);
        }
    }

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
            />

            {/* Page body */}
            <div className="container" style={{ paddingTop: '36px', paddingBottom: '64px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* Problems Section */}
                {contest.problems.length > 0 ? (
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
