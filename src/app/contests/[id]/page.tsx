import { prisma } from '@/lib/db';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { AddProblemForm } from './AddProblemForm';
import { RegisterButton } from './RegisterButton';
import { ProblemsList } from './ProblemsList';
import { ContestHero } from '@/components/ContestHero';

function getPointsLabel(pts: number) {
    if (pts <= 80)  return { label: 'E', title: 'Easy',   cls: 'diff-e' };
    if (pts <= 120) return { label: 'M', title: 'Medium', cls: 'diff-m' };
    if (pts <= 200) return { label: 'H', title: 'Hard',   cls: 'diff-h' };
    return              { label: 'X', title: 'Expert', cls: 'diff-x' };
}


export default async function ContestPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    let contest: any = null;
    let submissions: any[] = [];

    try {
        contest = await prisma.contest.findUnique({
            where: { id: params.id },
            include: {
                problems: true,
                registrations: { where: { userId: session?.user?.id } }
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

    const isRegistered = contest.registrations.length > 0;

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
                participantCount={contest.registrations?.length ?? 0}
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
                        {session && isRegistered && isActive ? (
                            <ProblemsList
                                problems={contest.problems}
                                contestId={contest.id}
                                initialSubmissions={submissions}
                            />
                        ) : (
                            <div className="g" style={{ overflow: 'hidden' }}>
                                {contest.problems.map((problem: any, idx: number) => {
                                    const diff = getPointsLabel(problem.points);
                                    return (
                                        <div
                                            key={problem.id}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '28px 20px 1fr auto auto',
                                                gap: '12px',
                                                alignItems: 'center',
                                                padding: '14px 20px',
                                                borderBottom: '1px solid var(--border)',
                                            }}
                                        >
                                            {/* Letter */}
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)', fontWeight: 500 }}>
                                                {String.fromCharCode(65 + idx)}.
                                            </span>
                                            {/* Diff dot */}
                                            <div className={`diff-dot ${diff.cls}`} title={diff.title} />
                                            {/* Title */}
                                            <span style={{ fontFamily: 'var(--ff-ui)', fontWeight: 500, color: 'var(--ink)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {problem.title}
                                            </span>
                                            {/* Points */}
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--sage)', whiteSpace: 'nowrap', background: 'var(--sage-bg)', border: '1px solid var(--sage-border)', padding: '2px 8px', borderRadius: '99px' }}>
                                                +{problem.points} XP
                                            </span>
                                            {/* Action cell — always one grid column */}
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                {!session && (
                                                    <span style={{ fontSize: '11px', fontFamily: 'var(--ff-mono)', color: 'var(--ink5)', whiteSpace: 'nowrap' }}>Log in</span>
                                                )}
                                                {session && !isRegistered && !isPast && !session?.user?.isAdmin && (
                                                    <span style={{ fontSize: '11px', fontFamily: 'var(--ff-mono)', color: 'var(--ink5)', whiteSpace: 'nowrap' }}>Register</span>
                                                )}
                                                {session && isRegistered && isUpcoming && !session?.user?.isAdmin && (
                                                    <span style={{ fontSize: '11px', fontFamily: 'var(--ff-mono)', color: 'var(--ink5)', whiteSpace: 'nowrap' }}>Starts soon</span>
                                                )}
                                                {isPast && (
                                                    <Link href={`/contests/${contest.id}/problems/${problem.id}`} className="btn btn-theme btn-sm">
                                                        View
                                                    </Link>
                                                )}
                                                {session?.user?.isAdmin && (
                                                    <Link href={`/admin/contests/${contest.id}/problems/${problem.id}/edit`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--sage)', background: 'var(--sage-bg)', border: '1px solid var(--sage-border)', borderRadius: '6px', padding: '3px 10px', textDecoration: 'none', whiteSpace: 'nowrap' }}>Edit</Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
