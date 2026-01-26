'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ArenaClient({ contest, initialSubmissions }: { contest: any, initialSubmissions: any[] }) {
    const [selectedProblemId, setSelectedProblemId] = useState(contest.problems[0]?.id);
    const [submissions, setSubmissions] = useState(initialSubmissions);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ success: boolean, message: string } | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeProblem = contest.problems.find((p: any) => p.id === selectedProblemId);

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
                    contestId: contest.id,
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
                setFeedback({ success: true, message: 'Correct Answer!' });
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
        <div className="grid grid-cols-12 gap-6 h-full">
            {/* Sidebar Problems List */}
            <div className="col-span-12 md:col-span-3 border-r pr-4 space-y-2 h-full overflow-y-auto">
                <h2 className="font-bold mb-4">Problems</h2>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {contest.problems.map((problem: any, idx: number) => {
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
            <div className="col-span-12 md:col-span-9 h-full overflow-y-auto">
                <div className="max-w-3xl">
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-3xl font-bold">{activeProblem.title}</h1>
                        <span className="badge badge-outline border px-2 py-1 rounded text-sm">
                            {activeProblem.points} Pts
                        </span>
                    </div>

                    <div className="prose dark:prose-invert max-w-none bg-card p-6 rounded-lg border mb-8 whitespace-pre-wrap font-serif">
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
                                        Submissions are case-insensitive.
                                    </p>
                                </div>

                                {feedback && (
                                    <div className={cn(
                                        "p-3 rounded-md text-sm",
                                        feedback.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    )}>
                                        {feedback.message}
                                    </div>
                                )}

                                <button disabled={loading} className="btn btn-primary w-full">
                                    {loading ? 'Checking...' : 'Submit'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
