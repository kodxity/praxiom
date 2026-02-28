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
