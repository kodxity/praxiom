'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarkdownContent } from '@/components/MarkdownContent';

interface Props {
    contestId: string;
    problemId: string;
    initialSolved: boolean;
    initialAttempts: number;
    labelColor: string;
    xpPoints?: number;
    problemTitle?: string;
    nextProblemId?: string;
    nextProblemLetter?: string;
    // Hint props - hintText is only provided server-side if already purchased
    hasHint?: boolean;
    hintCost?: number;
    userXp?: number;
    hintText?: string;
    transitionImages?: { url: string }[];
}

function MathDoodle() {
    return (
        <svg viewBox="0 0 1200 350" xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%', display: 'block' }}
            preserveAspectRatio="xMidYMax slice">
            <path d="M0 280 C200 220 400 260 600 200 C800 140 1000 250 1200 220 L1200 350 L0 350 Z"
                fill="var(--sage)" fillOpacity={0.08} />
            <path d="M0 320 C150 290 350 310 550 280 C750 250 950 300 1200 280 L1200 350 L0 350 Z"
                fill="var(--sage)" fillOpacity={0.12} />
            <text x="80" y="240" fontSize="52" fill="var(--sage)" fillOpacity={0.22}
                fontFamily="serif" fontStyle="italic">π</text>
            <text x="260" y="200" fontSize="40" fill="var(--sage)" fillOpacity={0.18}
                fontFamily="serif">Σ</text>
            <text x="460" y="220" fontSize="56" fill="var(--sage)" fillOpacity={0.15}
                fontFamily="serif">∞</text>
            <text x="680" y="195" fontSize="46" fill="var(--sage)" fillOpacity={0.22}
                fontFamily="serif">√</text>
            <text x="880" y="230" fontSize="48" fill="var(--sage)" fillOpacity={0.17}
                fontFamily="serif">∫</text>
            <text x="1080" y="215" fontSize="50" fill="var(--sage)" fillOpacity={0.2}
                fontFamily="serif">Δ</text>
            <polygon points="160,130 180,100 200,130" fill="none"
                stroke="var(--sage)" strokeOpacity={0.22} strokeWidth="1.5" />
            <circle cx="400" cy="118" r="20" fill="none"
                stroke="var(--sage)" strokeOpacity={0.18} strokeWidth="1.5" />
            <polygon points="680,95 700,95 710,113 700,131 680,131 670,113" fill="none"
                stroke="var(--sage)" strokeOpacity={0.16} strokeWidth="1.5" />
            <rect x="920" y="105" width="32" height="32" fill="none"
                stroke="var(--sage)" strokeOpacity={0.18} strokeWidth="1.5"
                transform="rotate(15, 936, 121)" />
            <path d="M50 75 L54 65 L58 75 L68 79 L58 83 L54 93 L50 83 L40 79 Z"
                fill="var(--sage)" fillOpacity={0.32} />
            <path d="M340 55 L344 45 L348 55 L358 59 L348 63 L344 73 L340 63 L330 59 Z"
                fill="var(--sage)" fillOpacity={0.36} />
            <path d="M590 42 L594 32 L598 42 L608 46 L598 50 L594 60 L590 50 L580 46 Z"
                fill="var(--sage)" fillOpacity={0.26} />
            <path d="M820 60 L824 50 L828 60 L838 64 L828 68 L824 78 L820 68 L810 64 Z"
                fill="var(--sage)" fillOpacity={0.3} />
            <path d="M1120 68 L1124 58 L1128 68 L1138 72 L1128 76 L1124 86 L1120 76 L1110 72 Z"
                fill="var(--sage)" fillOpacity={0.28} />
            <circle cx="140" cy="165" r="2" fill="var(--sage)" fillOpacity={0.45} />
            <circle cx="285" cy="148" r="2.5" fill="var(--sage)" fillOpacity={0.38} />
            <circle cx="510" cy="155" r="2" fill="var(--sage)" fillOpacity={0.42} />
            <circle cx="750" cy="152" r="2.5" fill="var(--sage)" fillOpacity={0.35} />
            <circle cx="990" cy="162" r="2" fill="var(--sage)" fillOpacity={0.4} />
            <line x1="0" y1="280" x2="1200" y2="280"
                stroke="var(--sage)" strokeOpacity={0.1} strokeWidth="1" />
        </svg>
    );
}

export default function ActiveSubmitPanel({
    contestId,
    problemId,
    initialSolved,
    initialAttempts,
    labelColor,
    xpPoints = 100,
    problemTitle = 'Problem',
    nextProblemId,
    nextProblemLetter,
    hasHint = false,
    hintCost = 0,
    userXp: initialUserXp = 0,
    hintText: initialHintText,
    transitionImages,
}: Props) {
    const router = useRouter();
    const [answer, setAnswer]         = useState('');
    const [loading, setLoading]       = useState(false);
    const [solved, setSolved]         = useState(initialSolved);
    const [attempts, setAttempts]     = useState(initialAttempts);
    const [feedback, setFeedback]     = useState<{ correct: boolean; message: string } | null>(null);
    const [showTransition, setShowTransition] = useState(false);
    const [transitionImageIndex, setTransitionImageIndex] = useState(0);
    // Hint state
    const [revealedHintText, setRevealedHintText] = useState<string | undefined>(initialHintText);
    const [localXp, setLocalXp]       = useState(initialUserXp);
    const [hintLoading, setHintLoading] = useState(false);
    const [hintError, setHintError]   = useState('');
    const [xpLoading, setXpLoading]   = useState(true);

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
    useEffect(() => {
        if (showTransition) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [showTransition]);

    const hintUsed = !!revealedHintText;

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
                if (data.isCorrect) {
                    setAttempts(a => a + 1);
                    setSolved(true);
                    setAnswer('');
                    if (data.xpAwarded) setLocalXp(xp => xp + data.xpAwarded);
                    setShowTransition(true);
                } else {
                    setAttempts(a => a + 1);
                    setFeedback({ correct: false, message: 'Incorrect - try again.' });
                }
            } else {
                setFeedback({ correct: false, message: 'Could not submit. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    }

    const nextHref = nextProblemId
        ? `/contests/${contestId}/problems/${nextProblemId}`
        : `/contests/${contestId}/standings`;

    if (showTransition && transitionImages && transitionImageIndex < transitionImages.length) {
        const currentImageUrl = transitionImages[transitionImageIndex].url;
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'var(--glass-strong, rgba(8,16,11,0.97))',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                paddingTop: '80px',
            }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '48px', overflow: 'hidden' }}>
                    <img 
                        src={currentImageUrl} 
                        alt="Transition Image" 
                        style={{ width: '100%', height: '100%', maxWidth: '1280px', maxHeight: '720px', objectFit: 'contain', borderRadius: '8px' }} 
                    />
                </div>
                <div style={{ padding: '24px', flexShrink: 0 }}>
                    <button
                        onClick={() => setTransitionImageIndex(i => i + 1)}
                        style={{
                            padding: '12px 32px', borderRadius: 'var(--r)',
                            background: 'var(--sage)', color: '#fff', border: 'none',
                            fontFamily: 'var(--ff-ui)', fontSize: '15px', fontWeight: 600,
                            cursor: 'pointer', letterSpacing: '0.02em',
                        }}
                    >
                        Next →
                    </button>
                </div>
            </div>
        );
    }

    if (showTransition) {
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'var(--glass-strong, rgba(8,16,11,0.97))',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                display: 'flex', flexDirection: 'column',
                paddingTop: '80px',
            }}>
                {/* Top half - celebration */}
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '48px 24px', gap: '18px',
                }}>
                    <div style={{
                        fontFamily: 'var(--ff-mono)', fontSize: '11px',
                        letterSpacing: '0.22em', color: 'var(--sage)', textTransform: 'uppercase',
                    }}>
                        ✦ Level Complete ✦
                    </div>
                    <div style={{
                        fontFamily: 'var(--ff-display)', fontStyle: 'italic',
                        fontSize: 'clamp(52px, 10vw, 96px)', color: 'var(--sage)',
                        lineHeight: 1, fontWeight: 400,
                    }}>
                        +{xpPoints} XP
                    </div>
                    {hintUsed && (
                        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink4)', letterSpacing: '0.08em' }}>
                            hint used
                        </div>
                    )}
                    <div style={{
                        fontFamily: 'var(--ff-body)', fontSize: '14px',
                        color: 'var(--ink4)', textAlign: 'center', maxWidth: '340px',
                    }}>
                        <em>{problemTitle}</em> solved in {attempts} attempt{attempts !== 1 ? 's' : ''}!
                    </div>
                    <button
                        onClick={() => router.push(nextHref)}
                        style={{
                            marginTop: '8px', padding: '12px 32px', borderRadius: 'var(--r)',
                            background: 'var(--sage)', color: '#fff', border: 'none',
                            fontFamily: 'var(--ff-ui)', fontSize: '15px', fontWeight: 600,
                            cursor: 'pointer', letterSpacing: '0.02em',
                        }}
                    >
                        {nextProblemId ? `Next Level (${nextProblemLetter}) →` : 'View Standings →'}
                    </button>
                </div>

                {/* Bottom half - doodle */}
                <div style={{ height: '50vh', overflow: 'hidden', flexShrink: 0 }}>
                    <MathDoodle />
                </div>
            </div>
        );
    }

    if (solved) {
        return (
            <div className="g answer-panel" style={{ padding: '20px 24px' }}>
                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: labelColor, textTransform: 'uppercase', marginBottom: '14px' }}>
                    Submit Answer
                </p>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '14px 18px', borderRadius: 'var(--r-lg)',
                    background: 'var(--sage-bg)', border: '1px solid var(--sage-border)',
                    fontFamily: 'var(--ff-ui)', fontWeight: 500, fontSize: '14px',
                    color: 'var(--sage)',
                }}>
                    ✓ Solved{attempts > 0 ? ` in ${attempts} attempt${attempts !== 1 ? 's' : ''}` : ''}
                </div>
            </div>
        );
    }

    return (
        <div className="g answer-panel" style={{ padding: '20px 24px' }}>
            <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: labelColor, textTransform: 'uppercase', marginBottom: '16px' }}>
                Submit Answer
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
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

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {attempts > 0 && (
                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: labelColor }}>
                        {attempts} attempt{attempts !== 1 ? 's' : ''}
                    </span>
                )}
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: labelColor }}>
                    Answers are case-insensitive
                </span>
            </div>

            {hasHint && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    {revealedHintText ? (
                        // Already purchased - show hint text
                        <div>
                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.18em', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>💡</span> HINT
                                <span style={{ opacity: 0.5, fontWeight: 400 }}>· {hintCost} XP spent</span>
                            </div>
                            <div style={{ padding: '4px 16px 12px', background: 'rgba(107,148,120,0.06)', borderRadius: 'var(--r)', border: '1px solid var(--sage-border)', fontSize: '14.5px' }}>
                                <MarkdownContent content={revealedHintText} />
                            </div>
                        </div>
                    ) : (
                        // Not yet purchased
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
