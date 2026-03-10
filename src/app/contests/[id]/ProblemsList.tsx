<<<<<<< HEAD
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProblemsList({ problems, contestId, initialSubmissions }: { problems: any[], contestId: string, initialSubmissions: any[] }) {
    const [submissions, setSubmissions] = useState(initialSubmissions);
    const [selectedProblemId, setSelectedProblemId] = useState(problems[0]?.id);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ success: boolean, message: string } | null>(null);
    const router = useRouter();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeProblem = problems.find((p: any) => p.id === selectedProblemId);

    // Get status for each problem
    const getProblemStatus = (problemId: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const problemSubmissions = submissions.filter((s: any) => s.problemId === problemId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (problemSubmissions.some((s: any) => s.isCorrect)) return 'accepted';
        if (problemSubmissions.length > 0) return 'wrong';
        return 'unattempted';
    };

    const activeStatus = activeProblem ? getProblemStatus(activeProblem.id) : 'unattempted';

    async function submitAnswer(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);

        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                body: JSON.stringify({
                    contestId,
                    problemId: selectedProblemId,
                    answer
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await res.json();

            const newSubmission = {
                id: result.id,
                problemId: selectedProblemId,
                isCorrect: result.isCorrect,
                createdAt: new Date().toISOString()
            };

            setSubmissions([...submissions, newSubmission]);

            if (result.isCorrect) {
                setFeedback({ success: true, message: 'Correct Answer! ✓' });
                setAnswer('');
                router.refresh();
            } else {
                setFeedback({ success: false, message: 'Wrong Answer. Try again.' });
            }
        } catch (error) {
            console.error(error);
            setFeedback({ success: false, message: 'Error submitting.' });
        } finally {
            setLoading(false);
        }
    }

    if (!activeProblem) {
        return <div>No problems in this contest.</div>;
    }

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Sidebar Problems List */}
            <div className="col-span-12 md:col-span-3 space-y-2">
                <h3 className="font-bold mb-4 text-sm uppercase text-muted-foreground">Problems</h3>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {problems.map((problem: any, idx: number) => {
                    const status = getProblemStatus(problem.id);
                    return (
                        <button
                            key={problem.id}
                            onClick={() => { setSelectedProblemId(problem.id); setAnswer(''); setFeedback(null); }}
                            className={cn(
                                "w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center",
                                selectedProblemId === problem.id ? "bg-primary/10 border-primary" : "hover:bg-muted",
                                status === 'accepted' && "border-green-500 bg-green-50 dark:bg-green-900/20",
                                status === 'wrong' && selectedProblemId !== problem.id && "border-red-500 bg-red-50 dark:bg-red-900/20"
                            )}
                        >
                            <span className="font-medium">Problem {String.fromCharCode(65 + idx)}</span>
                            {status === 'accepted' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {status === 'wrong' && <XCircle className="w-4 h-4 text-red-500" />}
                        </button>
                    );
                })}
            </div>

            {/* Main Content */}
            <div className="col-span-12 md:col-span-9">
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold">{activeProblem.title}</h2>
                        <span className="px-3 py-1 rounded bg-muted text-sm font-medium">
                            {activeProblem.points} Points
                        </span>
                    </div>

                    <div className="card bg-muted/30 whitespace-pre-wrap font-serif">
                        {activeProblem.statement}
                    </div>

                    <div className="card max-w-md">
                        <h3 className="font-bold mb-4">Submit Answer</h3>
                        {activeStatus === 'accepted' ? (
                            <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-2">
                                <CheckCircle /> You have solved this problem!
                            </div>
                        ) : (
                            <form onSubmit={submitAnswer} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Enter your answer..."
                                        className="input"
                                        value={answer}
                                        onChange={e => setAnswer(e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Answers are case-insensitive.
                                    </p>
                                </div>

                                {feedback && (
                                    <div className={cn(
                                        "p-3 rounded-md text-sm font-medium",
                                        feedback.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    )}>
                                        {feedback.message}
                                    </div>
                                )}

                                <button disabled={loading} className="btn btn-primary w-full">
                                    {loading ? 'Checking...' : 'Submit Answer'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
=======
﻿'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Lock } from 'lucide-react';
import CustomSelect from '@/components/CustomSelect';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProblemsList({ problems, contestId, initialSubmissions, lockedIds = [] }: { problems: any[], contestId: string, initialSubmissions: any[], lockedIds?: string[] }) {
    const lockedSet = new Set(lockedIds);
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('');

    function getDiffLabel(pts: number) {
        if (pts <= 80)  return 'Easy';
        if (pts <= 120) return 'Medium';
        if (pts <= 200) return 'Hard';
        return 'Expert';
    }

    function getDiffCls(pts: number) {
        if (pts <= 80)  return 'diff-e';
        if (pts <= 120) return 'diff-m';
        if (pts <= 200) return 'diff-h';
        return 'diff-x';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = problems.filter((p: any) => {
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (difficulty && getDiffLabel(p.points) !== difficulty) return false;
        return true;
    });

    function getStatus(problemId: string) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subs = initialSubmissions.filter((s: any) => s.problemId === problemId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (subs.some((s: any) => s.isCorrect)) return 'accepted';
        if (subs.length > 0) return 'wrong';
        return 'unattempted';
    }

    return (
        <div className="fade-in">
            {/* Filter bar */}
            <div style={{
                padding: '12px 18px', marginBottom: '12px',
                display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
                overflow: 'visible',
                background: 'var(--glass)', backdropFilter: 'blur(22px) saturate(1.5)',
                WebkitBackdropFilter: 'blur(22px) saturate(1.5)',
                border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow)',
                borderRadius: 'var(--r-lg)',
            }}>
                <div className="search-wrap" style={{ flex: 1, minWidth: '160px' }}>
                    <svg className="search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className="input input-search"
                        placeholder="Search problems..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
                <CustomSelect
                    value={difficulty}
                    onChange={setDifficulty}
                    options={[
                        { value: '', label: 'Difficulty' },
                        { value: 'Easy', label: 'Easy' },
                        { value: 'Medium', label: 'Medium' },
                        { value: 'Hard', label: 'Hard' },
                        { value: 'Expert', label: 'Expert' },
                    ]}
                    placeholder="Difficulty"
                    style={{ width: '120px' }}
                />
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', flexShrink: 0 }}>
                    {filtered.length}/{problems.length}
                </span>
            </div>

            {/* Problem rows */}
            <div className="g" style={{ overflow: 'hidden' }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {filtered.map((problem: any) => {
                    const origIdx = problems.indexOf(problem);
                    const letter = String.fromCharCode(65 + origIdx);
                    const status = getStatus(problem.id);
                    const isLocked = lockedSet.has(problem.id);

                    const rowStyle = {
                        display: 'grid' as const,
                        gridTemplateColumns: '28px 20px 1fr auto 24px',
                        gap: '12px',
                        alignItems: 'center' as const,
                        padding: '13px 20px',
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                    };

                    if (isLocked) {
                        const prevLetter = origIdx > 0 ? String.fromCharCode(65 + origIdx - 1) : '';
                        return (
                            <div key={problem.id} className="prob-row" style={{ ...rowStyle, opacity: 0.42, cursor: 'not-allowed' }}
                                title={prevLetter ? `Solve ${prevLetter} first to unlock` : ''}>
                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)' }}>{letter}.</span>
                                <div className={`diff-dot ${getDiffCls(problem.points)}`} title={getDiffLabel(problem.points)} />
                                <span className="prob-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink5)' }}>
                                    {problem.title}
                                </span>
                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)', padding: '2px 8px', whiteSpace: 'nowrap' }}>
                                    +{problem.points} XP
                                </span>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Lock style={{ width: '13px', height: '13px', color: 'var(--ink5)' }} />
                                </div>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={problem.id}
                            href={`/contests/${contestId}/problems/${problem.id}`}
                            className="prob-row"
                            style={{
                                ...rowStyle,
                                textDecoration: 'none',
                                background: status === 'accepted' ? 'rgba(107,148,120,0.04)' : status === 'wrong' ? 'rgba(184,96,78,0.03)' : 'transparent',
                            }}
                        >
                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)' }}>
                                {letter}.
                            </span>
                            <div className={`diff-dot ${getDiffCls(problem.points)}`} title={getDiffLabel(problem.points)} />
                            <span className="prob-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink)' }}>
                                {problem.title}
                            </span>
                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--sage)', background: 'var(--sage-bg)', border: '1px solid var(--sage-border)', padding: '2px 8px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
                                +{problem.points} XP
                            </span>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                {status === 'accepted' && <CheckCircle style={{ width: '14px', height: '14px', color: 'var(--sage)' }} />}
                                {status === 'wrong' && <XCircle style={{ width: '14px', height: '14px', color: 'var(--rose)' }} />}
                            </div>
                        </Link>
                    );
                })}
                {filtered.length === 0 && (
                    <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink5)' }}>
                        No problems match your filters.
                    </div>
                )}
            </div>
        </div>
    );
}
>>>>>>> LATESTTHISONE-NEWMODES
