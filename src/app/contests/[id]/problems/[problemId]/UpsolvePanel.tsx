'use client';

import { useState, useEffect } from 'react';

interface UpsolvePanelProps {
    contestId: string;
    problemId: string;
    correctAnswer: string;
    initialSolved: boolean;
    initialAttempts: number;
    labelColor: string;
    solvedDuringContest?: boolean;
    // Hint props - hintText only provided if already purchased
    hasHint?: boolean;
    hintCost?: number;
    userXp?: number;
    hintText?: string;
}

export default function UpsolvePanel({
    contestId,
    problemId,
    correctAnswer,
    initialSolved,
    initialAttempts,
    labelColor,
    solvedDuringContest = false,
    hasHint = false,
    hintCost = 0,
    userXp: initialUserXp = 0,
    hintText: initialHintText,
}: UpsolvePanelProps) {
    const [answer, setAnswer]       = useState('');
    const [loading, setLoading]     = useState(false);
    const [solved, setSolved]       = useState(initialSolved);
    const [revealed, setRevealed]   = useState(false);
    const [attempts, setAttempts]   = useState(initialAttempts);
    const [feedback, setFeedback]   = useState<{ correct: boolean; message: string } | null>(null);
    // Hint state
    const [revealedHintText, setRevealedHintText] = useState<string | undefined>(initialHintText);
    const [localXp, setLocalXp]     = useState(initialUserXp);
    const [hintLoading, setHintLoading] = useState(false);
    const [hintError, setHintError] = useState('');
    const [xpLoading, setXpLoading] = useState(true);

    // Always fetch live XP on mount so stale server-side value is overridden
    useEffect(() => {
        fetch('/api/user/xp')
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data?.xp !== undefined) setLocalXp(data.xp); })
            .catch(() => {})
            .finally(() => setXpLoading(false));
    }, []);

    async function handleRevealHint() {
        if (revealedHintText || hintLoading) return;
        setHintLoading(true);
        setHintError('');
        try {
            const res = await fetch('/api/hints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problemId }),
            });
            const data = await res.json();
            if (res.ok) {
                setRevealedHintText(data.hint);
                if (!data.alreadyRevealed && data.newXp !== undefined) {
                    setLocalXp(data.newXp);
                }
            } else {
                setHintError(data.error ?? 'Could not reveal hint.');
            }
        } catch {
            setHintError('Network error.');
        } finally {
            setHintLoading(false);
        }
    }

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

    // Solved during live contest → show answer (locked)
    if (solvedDuringContest) {
        return (
            <div className="g answer-panel" style={{ padding: '20px 24px' }}>
                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: labelColor, textTransform: 'uppercase', marginBottom: '14px' }}>
                    Answer
                    <span className="answer-type-indicator" style={{ marginLeft: '8px' }}>
                        Solved
                    </span>
                </p>

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

    // Upsolve form (always available)
    return (
        <div className="g answer-panel" style={{ padding: '20px 24px' }}>
            <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: labelColor, textTransform: 'uppercase', marginBottom: '6px' }}>
                Upsolve
            </p>
            {solved && (
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 10px', borderRadius: '99px', marginBottom: '12px',
                    background: 'var(--sage-bg)', border: '1px solid var(--sage-border)',
                    fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--sage)',
                }}>
                    ✓ Solved
                </div>
            )}
            <p style={{ fontFamily: 'var(--ff-body)', fontSize: '13px', color: 'var(--ink3)', marginBottom: '16px' }}>
                The contest has ended. Submit below — upsolves don&apos;t affect ratings.
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setRevealed(r => !r)}
                    style={{
                        background: 'none', border: 'none', padding: '0',
                        cursor: 'pointer', fontFamily: 'var(--ff-mono)', fontSize: '10px',
                        letterSpacing: '0.1em', color: labelColor,
                        textDecoration: 'underline', textUnderlineOffset: '3px',
                    }}
                >
                    {revealed ? 'Unreveal Answer' : 'Reveal Answer'}
                </button>
            </div>

            {revealed && (
                <div style={{ marginTop: '12px' }}>
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
            )}

            {hasHint && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    {revealedHintText ? (
                        <div>
                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.18em', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>💡</span> HINT
                                <span style={{ opacity: 0.5, fontWeight: 400 }}>· {hintCost} XP spent</span>
                            </div>
                            <div style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', lineHeight: 1.7, color: 'var(--ink2)', padding: '12px 16px', background: 'rgba(107,148,120,0.06)', borderRadius: 'var(--r)', border: '1px solid var(--sage-border)' }}>
                                {revealedHintText}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={handleRevealHint}
                                    disabled={hintLoading || xpLoading || localXp < hintCost}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '7px',
                                        padding: '7px 14px', borderRadius: 'var(--r)',
                                        border: '1px solid var(--sage-border)',
                                        background: (!xpLoading && localXp >= hintCost) ? 'var(--sage-bg)' : 'rgba(0,0,0,0.03)',
                                        cursor: (hintLoading || xpLoading || localXp < hintCost) ? 'not-allowed' : 'pointer',
                                        fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 600,
                                        color: (!xpLoading && localXp >= hintCost) ? 'var(--sage)' : 'var(--ink5)',
                                        opacity: (hintLoading || xpLoading) ? 0.65 : 1,
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <span>💡</span>
                                    {hintLoading ? 'Purchasing…' : `Reveal Hint · ${hintCost} XP`}
                                </button>
                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: (!xpLoading && localXp >= hintCost) ? 'var(--ink4)' : 'var(--rose)' }}>
                                    {xpLoading ? 'Loading XP…' : `You have ${localXp} XP${localXp < hintCost ? ` · need ${hintCost - localXp} more` : ''}`}
                                </span>
                            </div>
                            {hintError && (
                                <div style={{ fontFamily: 'var(--ff-ui)', fontSize: '12px', color: 'var(--rose)', padding: '7px 12px', background: 'rgba(184,96,78,0.07)', border: '1px solid rgba(184,96,78,0.2)', borderRadius: 'var(--r)' }}>
                                    {hintError}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
