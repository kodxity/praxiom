import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import UpsolvePanel from './UpsolvePanel';
import ActiveSubmitPanel from './ActiveSubmitPanel';
import { ContestCountdown } from '@/components/ContestCountdown';

function getPointsLabel(pts: number) {
    if (pts <= 80)  return { label: 'E', title: 'Easy',   cls: 'diff-e' };
    if (pts <= 120) return { label: 'M', title: 'Medium', cls: 'diff-m' };
    if (pts <= 200) return { label: 'H', title: 'Hard',   cls: 'diff-h' };
    return              { label: 'X', title: 'Expert', cls: 'diff-x' };
}



export default async function ProblemViewPage(props: { params: Promise<{ id: string; problemId: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    let contest: any = null;
    let problem: any = null;
    let submissions: any[] = [];
    let allProblems: any[] = [];
    let isRegistered = false;
    let userSolvedIds = new Set<string>();

    try {
        contest = await prisma.contest.findUnique({
            where: { id: params.id },
        });
        if (!contest) notFound();

        problem = await prisma.problem.findUnique({
            where: { id: params.problemId },
            include: {
                contest: { select: { id: true, title: true } },
                _count: { select: { submissions: true } },
            },
        });
        if (!problem || problem.contestId !== params.id) notFound();

        allProblems = await prisma.problem.findMany({
            where: { contestId: params.id },
            orderBy: { id: 'asc' },
            select: { id: true, title: true, points: true },
        });

        if (session?.user?.id) {
            const allContestSubs = await prisma.submission.findMany({
                where: { userId: session.user.id, contestId: params.id },
                orderBy: { createdAt: 'desc' },
            });
            submissions = allContestSubs.filter((s: any) => s.problemId === params.problemId);
            userSolvedIds = new Set(
                allContestSubs.filter((s: any) => s.isCorrect && !s.isUpsolve).map((s: any) => s.problemId)
            );

            if (contest.contestType === 'team' || contest.contestType === 'relay') {
                const member = await prisma.contestTeamMember.findFirst({
                    where: { userId: session.user.id, team: { contestId: params.id } },
                });
                isRegistered = !!member;
                // Store relay order on the member object for locking logic below
                (contest as any)._myRelayOrder = member?.relayOrder ?? null;
            } else {
                const reg = await prisma.registration.findUnique({
                    where: { userId_contestId: { userId: session.user.id, contestId: params.id } },
                });
                isRegistered = !!reg;
            }
        }
    } catch {
        notFound();
    }

    // Hint reveal status (persisted in DB so it survives page refresh)
    let initialHintRevealed = false;
    let userXp = 0;
    if (session?.user?.id) {
        try {
            const [hintReveal, dbUser] = await Promise.all([
                problem?.hint
                    ? prisma.hintReveal.findUnique({
                        where: { userId_problemId: { userId: session.user.id, problemId: params.problemId } },
                    })
                    : null,
                prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { xp: true },
                }),
            ]);
            initialHintRevealed = !!hintReveal;
            userXp = dbUser?.xp ?? 0;
        } catch { /* ignore */ }
    }

    const now = new Date();
    const isPast = now > contest.endTime;
    const isActive = now >= contest.startTime && now <= contest.endTime;
    const isUpcoming = now < contest.startTime;

    const diff = getPointsLabel(problem.points);
    const problemIndex = allProblems.findIndex((p: any) => p.id === params.problemId);
    const letter = String.fromCharCode(65 + problemIndex);

    // Solved by user?
    const userSolved = submissions.some((s: any) => s.isCorrect);
    // Solved correctly via upsolve specifically (determines if upsolve form should still show)
    const upsolveSolvedCorrectly = submissions.some((s: any) => s.isCorrect && s.isUpsolve);
    // Attempts split by context
    const activeAttempts = submissions.filter((s: any) => !s.isUpsolve).length;
    const upsolveAttempts = submissions.filter((s: any) => s.isUpsolve).length;

    // Total attempts (across all users)
    const totalAttempts = problem._count.submissions;

    // Sequential locking: problem is locked if any earlier problem is unsolved (individual only)
    const firstUnsolvedIdx = allProblems.findIndex((p: any) => !userSolvedIds.has(p.id));
    const contestType = contest.contestType as string;

    let isLocked = false;
    let lockReason = '';
    if (isActive && isRegistered) {
        if (contestType === 'relay') {
            const mySlot: number | null = (contest as any)._myRelayOrder ?? null;
            if (mySlot === null) {
                // Relay slot not assigned yet
                isLocked = true;
                lockReason = 'relay-unassigned';
            } else if (mySlot !== problemIndex + 1) {
                // User is assigned to a different slot
                isLocked = true;
                lockReason = 'relay-wrong-slot';
            }
        } else if (contestType === 'individual') {
            isLocked = firstUnsolvedIdx !== -1 && problemIndex > firstUnsolvedIdx;
            lockReason = 'sequential';
        }
        // team: no locking
    }

    const prevProblem = problemIndex > 0 ? allProblems[problemIndex - 1] : null;
    const prevLetter = problemIndex > 0 ? String.fromCharCode(65 + problemIndex - 1) : '';

    // Next problem for transition screen
    const nextProblem = problemIndex < allProblems.length - 1 ? allProblems[problemIndex + 1] : null;
    const nextProblemId = (isActive && isRegistered && nextProblem) ? nextProblem.id : undefined;
    const nextProblemLetter = nextProblem ? String.fromCharCode(65 + problemIndex + 1) : undefined;

    const labelColor    = 'var(--ink5)';
    const titleColor    = 'var(--ink)';
    const bodyColor     = 'var(--ink2)';
    const crumbStyle    = { color: 'var(--ink5)', textDecoration: 'none' as const };
    const crumbLast     = 'var(--ink3)';

    return (
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '36px 1.75rem 80px' }}>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontFamily: 'var(--ff-mono)', fontSize: '11px', color: labelColor }}>
                <Link href="/contests" style={crumbStyle}>Contests</Link>
                <span>/</span>
                <Link href={`/contests/${params.id}`} style={crumbStyle}>{problem.contest.title}</Link>
                <span>/</span>
                <span style={{ color: crumbLast }}>{letter}. {problem.title}</span>
            </div>

            {/* Gate: hide problem content before contest starts (non-admins only) */}
            {isUpcoming && !session?.user?.isAdmin ? (
                <div className="g" style={{ padding: '48px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                    <div style={{ fontSize: '32px' }}>🔒</div>
                    <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '22px', color: 'var(--ink)' }}>Contest Not Started</div>
                    <div style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', color: 'var(--ink4)', maxWidth: '360px' }}>
                        This problem will be available when the contest begins.
                    </div>
                    <Link href={`/contests/${params.id}`} style={{ marginTop: '8px', padding: '8px 20px', borderRadius: 'var(--r)', background: 'var(--sage)', color: '#fff', fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                        Back to Contest
                    </Link>
                </div>
            ) : (

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Problem nav dots */}
                <div className="g prob-nav" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {allProblems.map((p: any, idx: number) => {
                        const isCurrent = p.id === params.problemId;
                        const dotLocked = contestType === 'individual' && isActive && isRegistered && firstUnsolvedIdx !== -1 && idx > firstUnsolvedIdx;
                        if (dotLocked && !isCurrent) {
                            return (
                                <div
                                    key={p.id}
                                    title={`🔒 ${String.fromCharCode(65 + idx)}. ${p.title}`}
                                    className="prob-nav-dot default"
                                    style={{ opacity: 0.35, cursor: 'not-allowed', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {String.fromCharCode(65 + idx)}
                                </div>
                            );
                        }
                        return (
                            <Link
                                key={p.id}
                                href={`/contests/${params.id}/problems/${p.id}`}
                                title={`${String.fromCharCode(65 + idx)}. ${p.title}`}
                                className={`prob-nav-dot ${isCurrent ? 'current' : 'default'}`}
                                style={{ textDecoration: 'none' }}
                            >
                                {String.fromCharCode(65 + idx)}
                            </Link>
                        );
                    })}
                    <span style={{ marginLeft: '8px', fontFamily: 'var(--ff-mono)', fontSize: '10px', color: labelColor }}>
                        Problem {letter} of {allProblems.length}
                    </span>
                </div>

                {/* Problem statement - hidden when locked */}
                {isLocked ? null : <div className="g prob-statement" style={{ padding: '28px 32px' }}>

                    {/* Contest tag row */}
                    <div className="prob-contest-tag" style={{ marginBottom: '16px' }}>
                        <span className="chapter">{problem.contest.title}</span>
                        <div className={`diff-dot ${diff.cls}`} title={diff.title} style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 6px' }} />
                        <span className="tag">{diff.title}</span>
                        <span className="tag" style={{ marginLeft: '6px' }}>+{problem.points} XP</span>
                    </div>

                    {/* Title */}
                    <h1 className="prob-title-main" style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 'clamp(22px, 3vw, 32px)', letterSpacing: '-0.02em', color: titleColor, fontWeight: 400, marginBottom: '24px', lineHeight: 1.15 }}>
                        {letter}. {problem.title}
                    </h1>

                    {/* Statement body */}
                    <div className="prob-body" suppressHydrationWarning style={{ fontFamily: 'var(--ff-body)', fontSize: '15px', lineHeight: 1.82, color: bodyColor, fontWeight: 300, whiteSpace: 'pre-wrap' }}>
                        {problem.statement}
                    </div>

                </div>}

                {/* Active contest - submit panel */}
                {isActive && session && isRegistered && isLocked && (
                    <div className="g" style={{ padding: '20px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
                            <div style={{ fontSize: '28px' }}>🔒</div>
                            {lockReason === 'relay-unassigned' ? (
                                <>
                                    <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '20px', color: 'var(--ink)' }}>Relay Slot Not Set</div>
                                    <div style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', color: 'var(--ink4)', maxWidth: '340px' }}>
                                        Your team leader needs to assign relay slots before the contest starts.
                                    </div>
                                    <Link href={`/contests/${params.id}?tab=team`} style={{ padding: '8px 20px', borderRadius: 'var(--r)', background: 'var(--sage)', color: '#fff', fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', marginTop: '4px' }}>
                                        View Team
                                    </Link>
                                </>
                            ) : lockReason === 'relay-wrong-slot' ? (
                                <>
                                    <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '20px', color: 'var(--ink)' }}>Not Your Slot</div>
                                    <div style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', color: 'var(--ink4)', maxWidth: '340px' }}>
                                        You are assigned to Slot {(contest as any)._myRelayOrder}. Navigate to Problem {String.fromCharCode(64 + ((contest as any)._myRelayOrder ?? 1))} to submit.
                                    </div>
                                    {allProblems[(contest as any)._myRelayOrder - 1] && (
                                        <Link href={`/contests/${params.id}/problems/${allProblems[(contest as any)._myRelayOrder - 1].id}`} style={{ padding: '8px 20px', borderRadius: 'var(--r)', background: 'var(--sage)', color: '#fff', fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', marginTop: '4px' }}>
                                            Go to Problem {String.fromCharCode(64 + ((contest as any)._myRelayOrder ?? 1))}
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '20px', color: 'var(--ink)' }}>Level Locked</div>
                                    <div style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', color: 'var(--ink4)', maxWidth: '300px' }}>
                                        Solve {prevLetter ? `${prevLetter}. ${prevProblem?.title}` : 'the previous problem'} first to unlock this level.
                                    </div>
                                    {prevProblem && (
                                        <Link href={`/contests/${params.id}/problems/${prevProblem.id}`} style={{ padding: '8px 20px', borderRadius: 'var(--r)', background: 'var(--sage)', color: '#fff', fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', marginTop: '4px' }}>
                                            ← Go to {prevLetter}
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
                {isActive && session && isRegistered && !isLocked && (
                    <ActiveSubmitPanel
                        contestId={params.id}
                        problemId={params.problemId}
                        initialSolved={userSolved}
                        initialAttempts={activeAttempts}
                        labelColor={labelColor}
                        xpPoints={problem.points}
                        problemTitle={problem.title}
                        nextProblemId={nextProblemId}
                        nextProblemLetter={nextProblemLetter}
                        hasHint={!!problem.hint}
                        hintCost={Math.floor(problem.points / 2)}
                        userXp={userXp}
                        hintText={initialHintRevealed ? (problem.hint ?? undefined) : undefined}
                    />
                )}
                {isActive && session && !isRegistered && (
                    <div className="g" style={{ padding: '20px 24px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', color: 'var(--ink3)' }}>
                            {contestType === 'team' || contestType === 'relay'
                                ? <><Link href={`/contests/${params.id}?tab=team`} style={{ color: 'var(--sage)' }}>Join or create a team</Link> to submit answers.</>
                                : <><Link href={`/contests/${params.id}`} style={{ color: 'var(--sage)' }}>Register for this contest</Link> to submit answers.</>
                            }
                        </p>
                    </div>
                )}
                {isActive && !session && (
                    <div className="g" style={{ padding: '20px 24px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', color: 'var(--ink3)' }}>
                            <Link href="/login" style={{ color: 'var(--sage)' }}>Sign in</Link> and register to submit during this contest.
                        </p>
                    </div>
                )}

                {/* Upsolve / Answer panel (past contests only) */}
                {isPast && session && (
                    <UpsolvePanel
                        contestId={params.id}
                        problemId={params.problemId}
                        correctAnswer={problem.correctAnswer}
                        initialSolved={upsolveSolvedCorrectly}
                        initialAttempts={upsolveAttempts}
                        labelColor={labelColor}
                        solvedDuringContest={userSolved && !upsolveSolvedCorrectly}
                        hasHint={!!problem.hint}
                        hintCost={Math.floor(problem.points / 2)}
                        userXp={userXp}
                        hintText={initialHintRevealed ? (problem.hint ?? undefined) : undefined}
                    />
                )}

                {/* Past contest - not logged in */}
                {isPast && !session && (
                    <div className="g" style={{ padding: '20px 24px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', color: 'var(--ink3)', marginBottom: '12px' }}>
                            <Link href="/login" style={{ color: 'var(--sage)' }}>Sign in</Link> to upsolve this problem.
                        </p>
                    </div>
                )}

                {/* Bottom row: stats + navigation */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>

                    {/* Stats */}
                    <div className="g" style={{ padding: '16px 20px', flex: 1 }}>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '26px', color: titleColor }}>{totalAttempts}</div>
                                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.1em', color: labelColor, textTransform: 'uppercase' }}>Attempts</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '26px', color: 'var(--sage)' }}>{problem.points}</div>
                                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.1em', color: labelColor, textTransform: 'uppercase' }}>Points</div>
                            </div>
                            <div style={{ marginLeft: 'auto', fontFamily: 'var(--ff-mono)', fontSize: '11px', color: labelColor }}>
                                <ContestCountdown endTime={contest.endTime} isActive={isActive} />
                            </div>
                        </div>
                    </div>

                    {/* Prev / Next buttons */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {problemIndex > 0 ? (
                            <Link
                                href={`/contests/${params.id}/problems/${allProblems[problemIndex - 1].id}`}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '10px 18px', borderRadius: 'var(--r)', fontSize: '13px',
                                    fontFamily: 'var(--ff-ui)', fontWeight: 500, textDecoration: 'none',
                                    background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink3)',
                                    height: '100%',
                                }}
                            >
                                ← Prev
                            </Link>
                        ) : <div style={{ width: '80px' }} />}
                        {problemIndex < allProblems.length - 1 ? (
                            <Link
                                href={`/contests/${params.id}/problems/${allProblems[problemIndex + 1].id}`}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '10px 18px', borderRadius: 'var(--r)', fontSize: '13px',
                                    fontFamily: 'var(--ff-ui)', fontWeight: 500, textDecoration: 'none',
                                    background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink3)',
                                    height: '100%',
                                }}
                            >
                                Next →
                            </Link>
                        ) : <div style={{ width: '80px' }} />}
                    </div>
                </div>

            </div>
            )} {/* end upcoming gate */}
        </div>
    );
}