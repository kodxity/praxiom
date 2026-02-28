import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

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
            orderBy: { points: 'asc' },
            select: { id: true, title: true, points: true },
        });

        if (session?.user?.id) {
            submissions = await prisma.submission.findMany({
                where: { userId: session.user.id, problemId: params.problemId },
                orderBy: { createdAt: 'desc' },
            });
        }
    } catch {
        notFound();
    }

    const now = new Date();
    const isPast = now > contest.endTime;
    const isActive = now >= contest.startTime && now <= contest.endTime;

    // Only allow viewing problem detail for past contests (active is handled by ProblemsList)
    if (isActive) {
        redirect(`/contests/${params.id}`);
    }

    const diff = getPointsLabel(problem.points);
    const problemIndex = allProblems.findIndex((p: any) => p.id === params.problemId);
    const letter = String.fromCharCode(65 + problemIndex);

    // Solved by user?
    const userSolved = submissions.some((s: any) => s.isCorrect);

    // Total correct submissions (across all users)
    const totalAttempts = problem._count.submissions;

    // Style helpers - CSS vars are remapped per-theme by ContestShell
    const cardStyle     = {};
    const labelColor    = 'var(--ink5)';
    const titleColor    = 'var(--ink)';
    const bodyColor     = 'var(--ink2)';
    const crumbStyle    = { color: 'var(--ink5)', textDecoration: 'none' as const };
    const crumbLast     = 'var(--ink3)';
    const navDotCurrent = {};
    const navDotDefault = {};

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 1.75rem 80px' }}>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontFamily: 'var(--ff-mono)', fontSize: '11px', color: labelColor }}>
                <Link href="/contests" style={crumbStyle}>Contests</Link>
                <span>/</span>
                <Link href={`/contests/${params.id}`} style={crumbStyle}>{problem.contest.title}</Link>
                <span>/</span>
                <span style={{ color: crumbLast }}>{letter}. {problem.title}</span>
            </div>

            <div className="prob-layout">

                {/* ── Main panel ── */}
                <div className="prob-main">

                    {/* Problem nav dots */}
                    <div className="g prob-nav" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', ...cardStyle }}>
                        {allProblems.map((p: any, idx: number) => {
                            const isCurrent = p.id === params.problemId;
                            return (
                                <Link
                                    key={p.id}
                                    href={`/contests/${params.id}/problems/${p.id}`}
                                    title={`${String.fromCharCode(65 + idx)}. ${p.title}`}
                                    className={`prob-nav-dot ${isCurrent ? 'current' : 'default'}`}
                                    style={{ textDecoration: 'none', ...(isCurrent ? navDotCurrent : navDotDefault) }}
                                >
                                    {String.fromCharCode(65 + idx)}
                                </Link>
                            );
                        })}
                        <span style={{ marginLeft: '8px', fontFamily: 'var(--ff-mono)', fontSize: '10px', color: labelColor }}>
                            Problem {letter} of {allProblems.length}
                        </span>
                    </div>

                    {/* Problem statement */}
                    <div className="g prob-statement" style={{ padding: '28px 32px', ...cardStyle }}>

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
                        <div className="prob-body" style={{ fontFamily: 'var(--ff-body)', fontSize: '15px', lineHeight: 1.82, color: bodyColor, fontWeight: 300, whiteSpace: 'pre-wrap' }}>
                            {problem.statement}
                        </div>



                    </div>
                </div>

                {/* ── Side panel ── */}
                <div className="prob-side">

                    {/* Contest info */}
                    <div className="g" style={{ padding: '18px 20px', ...cardStyle }}>
                        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: labelColor, textTransform: 'uppercase', marginBottom: '10px' }}>Contest</p>
                        <div style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '14px', color: titleColor, marginBottom: '4px' }}>{problem.contest.title}</div>
                        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: labelColor }}>
                            Ended {new Date(contest.endTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>

                    {/* Answer reveal (past contests only) */}
                    {isPast && (
                        <div className="g answer-panel" style={{ padding: '20px 22px' }}>
                            <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: labelColor, textTransform: 'uppercase', marginBottom: '14px' }}>
                                Answer
                                <span className="answer-type-indicator">Revealed</span>
                            </p>

                            {/* User's status */}
                            {session && (
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '4px 10px', borderRadius: '99px', marginBottom: '14px',
                                    background: userSolved ? 'var(--sage-bg)' : 'rgba(184,96,78,0.08)',
                                    border: `1px solid ${userSolved ? 'var(--sage-border)' : 'rgba(184,96,78,0.18)'}`,
                                    fontFamily: 'var(--ff-mono)', fontSize: '10px',
                                    color: userSolved ? 'var(--sage)' : 'var(--rose)',
                                }}>
                                    {userSolved ? '✓ You solved this' : `✗ You attempted this (${submissions.length} tries)`}
                                </div>
                            )}

                            {/* Answer box */}
                            <div style={{
                                padding: '16px 18px', borderRadius: 'var(--r-lg)',
                                background: 'rgba(107,148,120,0.06)',
                                border: '1px solid rgba(107,148,120,0.18)',
                                fontFamily: 'var(--ff-mono)', fontSize: '20px', fontWeight: 400,
                                color: 'var(--sage)',
                                textAlign: 'center', letterSpacing: '0.08em',
                            }}>
                                {problem.correctAnswer}
                            </div>

                            <p className="ans-format-hint" style={{ marginTop: '8px', textAlign: 'center', color: labelColor }}>
                                This was the correct answer for this problem.
                            </p>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="g" style={{ padding: '18px 20px', ...cardStyle }}>
                        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: labelColor, textTransform: 'uppercase', marginBottom: '14px' }}>Stats</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '28px', color: titleColor }}>{totalAttempts}</div>
                                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.1em', color: labelColor, textTransform: 'uppercase' }}>Attempts</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '28px', color: 'var(--sage)' }}>{problem.points}</div>
                                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.1em', color: labelColor, textTransform: 'uppercase' }}>Points</div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation arrows */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {problemIndex > 0 && (
                            <Link
                                href={`/contests/${params.id}/problems/${allProblems[problemIndex - 1].id}`}
                                style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '10px', borderRadius: 'var(--r)', fontSize: '13px',
                                    fontFamily: 'var(--ff-ui)', fontWeight: 500, textDecoration: 'none',
                                    background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink3)',
                                }}
                            >
                                ← Prev
                            </Link>
                        )}
                        {problemIndex < allProblems.length - 1 && (
                            <Link
                                href={`/contests/${params.id}/problems/${allProblems[problemIndex + 1].id}`}
                                style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '10px', borderRadius: 'var(--r)', fontSize: '13px',
                                    fontFamily: 'var(--ff-ui)', fontWeight: 500, textDecoration: 'none',
                                    background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink3)',
                                }}
                            >
                                Next →
                            </Link>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}