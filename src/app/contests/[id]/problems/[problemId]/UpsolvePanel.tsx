'use client';

import { useState } from 'react';

interface UpsolvePanelProps {
    contestId: string;
    problemId: string;
    correctAnswer: string;
    initialSolved: boolean;
    initialAttempts: number;
    labelColor: string;
}

export default function UpsolvePanel({
    contestId,
    problemId,
    correctAnswer,
    initialSolved,
    initialAttempts,
    labelColor,
}: UpsolvePanelProps) {
    const [answer, setAnswer]   = useState('');
    const [loading, setLoading] = useState(false);
    const [solved, setSolved]   = useState(initialSolved);
    const [revealed, setRevealed] = useState(false);
    const [attempts, setAttempts] = useState(initialAttempts);
    const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!answer.trim() || loading) return;
        setLoading(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contestId, problemId, answer }),
            });
            if (res.ok) {
                const data = await res.json();
                setAttempts(a => a + 1);
                if (data.isCorrect) {
                    setSolved(true);
                    setFeedback({ correct: true, message: 'Correct! Well done.' });
                    setAnswer('');
                } else {
                    setFeedback({ correct: false, message: 'Incorrect - try again.' });
                }
            } else {
                setFeedback({ correct: false, message: 'Could not submit. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    }

    // Solved or revealed → show answer
    if (solved || revealed) {
        return (
            <div className="g answer-panel" style={{ padding: '20px 24px' }}>
                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: labelColor, textTransform: 'uppercase', marginBottom: '14px' }}>
                    Answer
                    <span className="answer-type-indicator" style={{ marginLeft: '8px' }}>
                        {solved ? 'Solved' : 'Revealed'}
                    </span>
                </p>

                {solved && (
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 10px', borderRadius: '99px', marginBottom: '14px',
                        background: 'var(--sage-bg)',
                        border: '1px solid var(--sage-border)',
                        fontFamily: 'var(--ff-mono)', fontSize: '10px',
                        color: 'var(--sage)',
                    }}>
                        ✓ Solved{attempts > 0 ? ` in ${attempts} attempt${attempts !== 1 ? 's' : ''}` : ''}
                    </div>
                )}

                <div style={{
                    padding: '16px 18px', borderRadius: 'var(--r-lg)',
                    background: 'var(--sage-bg)',
                    border: '1px solid var(--sage-border)',
                    fontFamily: 'var(--ff-mono)', fontSize: '20px', fontWeight: 400,
                    color: 'var(--sage)',
                    textAlign: 'center', letterSpacing: '0.08em',
                }}>
                    {correctAnswer}
                </div>

                <p style={{ marginTop: '8px', textAlign: 'center', fontFamily: 'var(--ff-mono)', fontSize: '10px', color: labelColor }}>
                    This was the correct answer.
                </p>
            </div>
        );
    }

    // Not solved, not revealed → upsolve form
    return (
        <div className="g answer-panel" style={{ padding: '20px 24px' }}>
            <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: labelColor, textTransform: 'uppercase', marginBottom: '6px' }}>
                Upsolve
            </p>
            <p style={{ fontFamily: 'var(--ff-body)', fontSize: '13px', color: 'var(--ink3)', marginBottom: '16px' }}>
                The contest has ended. Submit below - upsolves don&apos;t affect ratings.
            </p>

            {feedback && (
                <div style={{
                    padding: '9px 12px', borderRadius: 'var(--r)', marginBottom: '12px',
                    fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 500,
                    background: feedback.correct ? 'var(--sage-bg)' : 'rgba(184,96,78,0.08)',
                    border: `1px solid ${feedback.correct ? 'var(--sage-border)' : 'rgba(184,96,78,0.18)'}`,
                    color: feedback.correct ? 'var(--sage)' : 'var(--rose)',
                }}>
                    {feedback.correct ? '✓ ' : '✗ '}{feedback.message}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                    type="text"
                    placeholder="Your answer…"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    required
                    style={{
                        flex: 1, minWidth: 0,
                        padding: '8px 12px', borderRadius: 'var(--r)',
                        border: '1px solid var(--border)',
                        background: 'var(--glass)',
                        fontFamily: 'var(--ff-mono)', fontSize: '14px',
                        color: 'var(--ink)', outline: 'none',
                    }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '8px 16px', borderRadius: 'var(--r)',
                        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                        background: 'var(--sage)', color: '#fff',
                        fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 600,
                        opacity: loading ? 0.65 : 1, flexShrink: 0,
                    }}
                >
                    {loading ? '…' : 'Submit'}
                </button>
            </form>

            {attempts > 0 && (
                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: labelColor, marginBottom: '10px' }}>
                    {attempts} upsolve attempt{attempts !== 1 ? 's' : ''}
                </p>
            )}

            <button
                onClick={() => setRevealed(true)}
                style={{
                    background: 'none', border: 'none', padding: '0',
                    cursor: 'pointer', fontFamily: 'var(--ff-mono)', fontSize: '10px',
                    letterSpacing: '0.1em', color: labelColor,
                    textDecoration: 'underline', textUnderlineOffset: '3px',
                }}
            >
                Reveal Answer
            </button>
        </div>
    );
}
