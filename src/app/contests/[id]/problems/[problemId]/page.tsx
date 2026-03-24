import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import UpsolvePanel from './UpsolvePanel';
import ActiveSubmitPanel from './ActiveSubmitPanel';
import { ContestCountdown } from '@/components/ContestCountdown';
import { MarkdownContent } from '@/components/MarkdownContent';

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
                transitionImages: {
                    orderBy: { order: 'asc' },
                    select: { url: true },
                },
            },
        });
        if (!problem || problem.contestId !== params.id) notFound();

        allProblems = await prisma.problem.findMany({
            where: { contestId: params.id },
            orderBy: { id: 'asc' },
            select: { id: true, title: true, points: true },
        });

        if (session?.user?.id) {
            let reg = null;
            if (contest.contestType === 'team' || contest.contestType === 'relay') {
                const member = await prisma.contestTeamMember.findFirst({
                    where: { userId: session.user.id, team: { contestId: params.id } },
                });
                isRegistered = !!member;
                (contest as any)._myRelayOrder = member?.relayOrder ?? null;
            } else {
                const regs = await prisma.registration.findMany({
                    where: { userId: session.user.id, contestId: params.id },
                    orderBy: { createdAt: 'desc' }
                });

                const now = new Date();
                const virtualReg = regs.find(r => r.isVirtual && r.startTime && (new Date(r.startTime.getTime() + (contest.duration ?? 0) * 60000) > now));
                const liveReg = regs.find(r => !r.isVirtual);
                reg = virtualReg || liveReg;
                isRegistered = !!reg;
                if (reg?.isVirtual) (contest as any).isVirtualParticipant = true;
                (contest as any).currentRegId = reg?.id;
            }

            const allContestSubs = await prisma.submission.findMany({
                where: { userId: session.user.id, contestId: params.id },
                orderBy: { createdAt: 'desc' },
            });

            // Use current registration for active submissions
            const curRegId = (contest as any).currentRegId;
            submissions = allContestSubs.filter((s: any) => s.problemId === params.problemId);
            
            // If in a virtual session, we only count solves from THIS session for locking
            userSolvedIds = new Set(
                allContestSubs.filter((s: any) => {
                    if (s.isUpsolve || !s.isCorrect) return false;
                    if (curRegId) return s.registrationId === curRegId;
                    return !s.isVirtual;
                }).map((s: any) => s.problemId)
            );
        }
    } catch {
        notFound();
    }

    // Hint reveal status (persisted in DB so it survives page refresh)
    let initialHintRevealed = false;
    let userXp = 0;
    
    // We also need reg details to calculate access
    let reg: any = null;
    let contestIsVirtualParticipant = false;
    let currentRegId: string | null = null;
    let myRelayOrder: number | null = null;
    
    // Attempt to extract those from the mutant contest object that existing code hacked together
    if ((contest as any).isVirtualParticipant) contestIsVirtualParticipant = true;
    if ((contest as any).currentRegId) currentRegId = (contest as any).currentRegId;
    if ((contest as any)._myRelayOrder !== undefined) myRelayOrder = (contest as any)._myRelayOrder;
    
    // Let's actually find the real registration if needed for startTime
    if (session?.user?.id && (!contestIsVirtualParticipant || currentRegId)) {
        if (contest.contestType !== 'team' && contest.contestType !== 'relay') {
             try {
                 reg = await prisma.registration.findFirst({
                     where: { id: currentRegId ?? undefined, userId: session.user.id, contestId: params.id },
                     orderBy: { createdAt: 'desc' }
                 });
             } catch {}
        }
    }

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
    const isUpcoming = now < contest.startTime;
    
    // Check if user is in an active virtual session
    const isVirtual = contestIsVirtualParticipant;
    const isActive = isVirtual || (!isPast && !isUpcoming);

    const diff = getPointsLabel(problem.points);
    const problemIndex = allProblems.findIndex((p: any) => p.id === params.problemId);
    const letter = String.fromCharCode(65 + problemIndex);
    
    // --------------------------------------------------------------------------------
    // NEW ACCESS GATE LOGIC
    // --------------------------------------------------------------------------------
    let gateReason: string | null = null;
    let isAdmin = session?.user?.isAdmin ?? false;

    if (!isAdmin) {
        if (isUpcoming) {
            gateReason = 'NOT_STARTED_GLOBAL';
        } else if (isActive && !isVirtual) { // Live contest
            if (!isRegistered) {
                gateReason = 'NOT_REGISTERED';
            } else if (contest.contestType !== 'team' && contest.contestType !== 'relay' && (!reg || !reg.startTime)) {
                gateReason = 'NOT_STARTED_PERSONAL';
            } else if (contest.contestType !== 'team' && contest.contestType !== 'relay' && reg && reg.startTime) {
                // Check if timer expired
                const personalEndTime = new Date(reg.startTime.getTime() + (contest.duration ?? 0) * 60000);
                if (now > personalEndTime) {
                    // Timer expired. Can only view if already solved/revealed earlier.
                    // For now, if they didn't unlock this problem during the contest, they are locked out until contest ends globally
                    if (!userSolvedIds.has(params.problemId)) {
                        gateReason = 'TIMER_EXPIRED';
                    }
                }
            }
        } else if (isVirtual) {
            if (!reg || !reg.startTime) {
                gateReason = 'NOT_STARTED_PERSONAL';
            }
        }
    }

    // Solved by user (split by mode)
    const solvedLive = submissions.some((s: any) => s.isCorrect && !s.isUpsolve && !s.isVirtual);
    const solvedVirtual = submissions.some((s: any) => s.isCorrect && s.isVirtual);
    const solvedUpsolve = submissions.some((s: any) => s.isCorrect && s.isUpsolve);
    const userSolved = solvedLive || solvedVirtual || solvedUpsolve;
    const nonLiveSolved = solvedVirtual || solvedUpsolve;
    // Attempts split by context
    const curRegId = currentRegId;
    const activeSubmissions = isVirtual && curRegId
        ? submissions.filter((s: any) => s.registrationId === curRegId)
        : submissions.filter((s: any) => !s.isUpsolve);
    const activeAttempts = activeSubmissions.length;
    const upsolveAttempts = submissions.filter((s: any) => s.isUpsolve).length;
    const activeSolved = activeSubmissions.some((s: any) => s.isCorrect);

    // Total attempts (across all users)
    const totalAttempts = problem._count.submissions;

    // Sequential locking: problem is locked if any earlier problem is unsolved (individual only)
    const firstUnsolvedIdx = allProblems.findIndex((p: any) => !userSolvedIds.has(p.id));
    const contestType = contest.contestType as string;

    let isLocked = false;
    let lockReason = '';
    // Only apply individual sequential locks if we made it past the hard gate
    if (!gateReason && isActive && isRegistered) {
        if (contestType === 'relay') {
            const mySlot: number | null = myRelayOrder;
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
            <div style={{ marginBottom: '18px' }}>
                <Link href={`/contests/${params.id}`} className="btn btn-ghost btn-sm">
                    {'<- Contest'}
                </Link>
            </div>

            {/* Gate: block access based on gateReason */}
            {gateReason ? (
                <div className="g" style={{ padding: '48px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                    <div style={{ fontSize: '32px' }}>🔒</div>
                    
                    {gateReason === 'NOT_STARTED_GLOBAL' && (
                        <>
                            <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '22px', color: 'var(--ink)' }}>Contest Not Started</div>
                            <div style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', color: 'var(--ink4)', maxWidth: '360px' }}>
                                This problem will be available when the contest begins.
                            </div>
                        </>
                    )}
                    
                    {gateReason === 'NOT_REGISTERED' && (
                        <>
                            <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '22px', color: 'var(--ink)' }}>Registration Required</div>
                            <div style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', color: 'var(--ink4)', maxWidth: '360px' }}>
                                You must register for this contest to view the problems while it is live.
                            </div>
                        </>
                    )}

                    {gateReason === 'NOT_STARTED_PERSONAL' && (
                        <>
                            <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '22px', color: 'var(--ink)' }}>Timer Not Started</div>
                            <div style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', color: 'var(--ink4)', maxWidth: '360px' }}>
                                You have registered, but you need to start your contest timer before viewing problems.
                            </div>
                        </>
                    )}

                    {gateReason === 'TIMER_EXPIRED' && (
                        <>
                            <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '22px', color: 'var(--ink)' }}>Time's Up</div>
                            <div style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', color: 'var(--ink4)', maxWidth: '360px' }}>
                                Your timer expired before you unlocked this problem. You will be able to view it and upsolve once the global contest ends.
                            </div>
                        </>
                    )}

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
                    <div className="prob-body" suppressHydrationWarning style={{ fontFamily: 'var(--ff-body)', fontSize: '15.5px', color: bodyColor, fontWeight: 300 }}>
                        <MarkdownContent content={problem.statement} />
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
                                        You are assigned to Slot {myRelayOrder ?? 1}. Navigate to Problem {String.fromCharCode(64 + (myRelayOrder ?? 1))} to submit.
                                    </div>
                                    {allProblems[(myRelayOrder ?? 1) - 1] && (
                                        <Link href={`/contests/${params.id}/problems/${allProblems[(myRelayOrder ?? 1) - 1].id}`} style={{ padding: '8px 20px', borderRadius: 'var(--r)', background: 'var(--sage)', color: '#fff', fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', marginTop: '4px' }}>
                                            Go to Problem {String.fromCharCode(64 + (myRelayOrder ?? 1))}
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
                        initialSolved={activeSolved}
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
                        transitionImages={problem.transitionImages}
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
                {isPast && session && !isVirtual && (
                    <UpsolvePanel
                        contestId={params.id}
                        problemId={params.problemId}
                        correctAnswer={problem.correctAnswer}
                        initialSolved={nonLiveSolved}
                        initialAttempts={upsolveAttempts}
                        labelColor={labelColor}
                        solvedDuringContest={solvedLive}
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
