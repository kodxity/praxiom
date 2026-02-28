'use client';

import { useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Send } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProblemsList({ problems, contestId, initialSubmissions }: { problems: any[], contestId: string, initialSubmissions: any[] }) {
    const [submissions, setSubmissions] = useState(initialSubmissions);
    const [selectedProblemId, setSelectedProblemId] = useState(problems[0]?.id);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ success: boolean, message: string } | null>(null);
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const router = useRouter();
    const isDark = false; // CSS vars remapped by ContestShell for all themes

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeProblem = problems.find((p: any) => p.id === selectedProblemId);

    function getDiffLabel(pts: number) {
        if (pts <= 80)  return 'Easy';
        if (pts <= 120) return 'Medium';
        if (pts <= 200) return 'Hard';
        return 'Expert';
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredProblems = problems.filter((p: any) => {
        if (!p.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (difficulty && getDiffLabel(p.points) !== difficulty) return false;
        return true;
    });

    const getProblemStatus = (problemId: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subs = submissions.filter((s: any) => s.problemId === problemId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (subs.some((s: any) => s.isCorrect)) return 'accepted';
        if (subs.length > 0) return 'wrong';
        return 'unattempted';
    };

    const activeStatus = activeProblem ? getProblemStatus(activeProblem.id) : 'unattempted';

    function selectProblem(id: string) {
        setSelectedProblemId(id);
        setAnswer('');
        setFeedback(null);
    }

    async function submitAnswer(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                body: JSON.stringify({ contestId, problemId: selectedProblemId, answer }),
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await res.json();
            const newSub = { id: result.id, problemId: selectedProblemId, isCorrect: result.isCorrect, createdAt: new Date().toISOString() };
            setSubmissions([...submissions, newSub]);
            if (result.isCorrect) {
                setFeedback({ success: true, message: 'Correct! âœ“' });
                setAnswer('');
                router.refresh();
            } else {
                setFeedback({ success: false, message: 'Wrong answer. Try again.' });
            }
        } catch {
            setFeedback({ success: false, message: 'Error submitting.' });
        } finally {
            setLoading(false);
        }
    }

    if (!activeProblem) {
        return (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ink4)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>
                No problems in this contest.
            </div>
        );
    }

    // â”€â”€ Shared search bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const searchBar = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
            <div className="search-wrap" style={{ flex: 1, minWidth: '160px' }}>
                <svg className="search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    className="input input-search"
                    placeholder="Search problems…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{}}
                />
            </div>
            <select
                className="select"
                style={{ width: '120px' }}
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
            >
                <option value="">Difficulty</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
                <option>Expert</option>
            </select>
        </div>
    );

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // JADE THEME LAYOUT
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (isDark) {
        return (
            <div className="theme-jade" style={{ borderRadius: 'var(--r-xl)' }}>
                <div className="theme-jade-doodle" />
                <div className="theme-jade-overlay" />
                <div className="theme-jade-content">

                    {/* Jade header */}
                    <div style={{ marginBottom: '28px' }}>
                        <p className="jade-eyebrow">JADE CITY Â· IMPERIAL CHALLENGES</p>
                        <h2 className="jade-title" style={{ fontSize: '24px', marginBottom: '6px' }}>Choose Your Trial</h2>
                        <p className="jade-sub" style={{ marginBottom: 0 }}>Each trial brings you closer to defeating the demon.</p>
                    </div>

                    {/* Story stepper */}
                    <div className="story-stepper" style={{ marginBottom: '28px' }}>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {problems.map((p: any, idx: number) => {
                            const st = getProblemStatus(p.id);
                            const stepCls = st === 'accepted' ? 'done' : p.id === selectedProblemId ? 'current' : 'locked';
                            return (
                                <Fragment key={p.id}>
                                    {idx > 0 && <div className="step-connector" />}
                                    <div className="story-step">
                                        <button
                                            className={`step-circle ${stepCls}`}
                                            onClick={() => selectProblem(p.id)}
                                            style={{ border: 'none', cursor: 'pointer' }}
                                        >
                                            {st === 'accepted' ? 'âœ“' : idx + 1}
                                        </button>
                                        <span className="step-label">Ch.&nbsp;{idx + 1}</span>
                                    </div>
                                </Fragment>
                            );
                        })}
                    </div>

                    {/* Search */}
                    <div style={{ marginBottom: '20px' }}>{searchBar}</div>

                    {/* 2-col grid */}
                    <div className="problems-grid">

                        {/* Jade sidebar */}
                        <div className="jade-glass" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(150,200,160,0.45)', padding: '4px 8px 8px', textTransform: 'uppercase' }}>Trials</div>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {filteredProblems.map((p: any, idx: number) => {
                                const st = getProblemStatus(p.id);
                                const isSel = selectedProblemId === p.id;
                                return (
                                    <button key={p.id} onClick={() => selectProblem(p.id)} style={{
                                        width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: '10px',
                                        border: isSel ? '1px solid rgba(150,220,160,0.35)' : '1px solid transparent',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                                        fontFamily: 'var(--ff-ui)', fontSize: '13px', transition: 'all 0.15s',
                                        background: isSel ? 'rgba(150,220,160,0.18)' : st === 'accepted' ? 'rgba(150,220,160,0.09)' : st === 'wrong' ? 'rgba(184,96,78,0.09)' : 'rgba(255,255,255,0.03)',
                                        color: isSel ? 'rgba(200,255,200,0.95)' : 'rgba(200,240,200,0.7)',
                                    }}>
                                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: isSel ? 'rgba(150,220,160,0.8)' : 'rgba(150,200,160,0.35)', flexShrink: 0 }}>{String.fromCharCode(65 + idx)}.</span>
                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                                        {st === 'accepted' && <CheckCircle style={{ width: '13px', height: '13px', color: 'rgba(150,220,160,0.8)', flexShrink: 0 }} />}
                                        {st === 'wrong'    && <XCircle    style={{ width: '13px', height: '13px', color: 'rgba(184,96,78,0.7)',  flexShrink: 0 }} />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Jade main area */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                <div>
                                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px', color: activeStatus === 'accepted' ? 'rgba(150,220,160,0.7)' : activeStatus === 'wrong' ? 'rgba(210,110,90,0.8)' : 'rgba(150,200,160,0.45)' }}>
                                        {activeStatus === 'accepted' ? 'âœ“ Solved' : activeStatus === 'wrong' ? 'âœ- Attempted' : 'TRIAL'}
                                    </div>
                                    <h2 style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 'clamp(1.2rem,2.2vw,1.7rem)', color: 'rgba(200,240,200,0.92)', lineHeight: 1.2 }}>
                                        {activeProblem.title}
                                    </h2>
                                </div>
                                <div style={{ flexShrink: 0, padding: '5px 12px', borderRadius: '8px', background: 'rgba(150,220,160,0.12)', border: '1px solid rgba(150,220,160,0.2)', fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'rgba(150,220,160,0.9)' }}>
                                    {activeProblem.points} pts
                                </div>
                            </div>

                            {/* Statement */}
                            <div className="jade-glass" style={{ padding: '22px 26px', whiteSpace: 'pre-wrap', fontFamily: 'var(--ff-body)', fontSize: '15px', lineHeight: 1.78, color: 'rgba(190,230,200,0.85)', fontWeight: 300 }}>
                                {activeProblem.statement}
                            </div>

                            {/* Answer panel */}
                            <div className="jade-glass" style={{ padding: '22px 26px' }}>
                                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(150,200,160,0.45)', textTransform: 'uppercase', marginBottom: '14px' }}>Submit Answer</div>

                                {activeStatus === 'accepted' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: 'rgba(150,220,160,0.12)', border: '1px solid rgba(150,220,160,0.25)', borderRadius: '10px', color: 'rgba(150,220,160,0.9)', fontFamily: 'var(--ff-ui)', fontWeight: 500, fontSize: '14px' }}>
                                        <CheckCircle style={{ width: '16px', height: '16px' }} />
                                        Trial complete. The demon trembles.
                                    </div>
                                ) : (
                                    <form onSubmit={submitAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <input
                                            type="text"
                                            placeholder="Enter your answerâ€¦"
                                            value={answer}
                                            onChange={e => setAnswer(e.target.value)}
                                            required
                                            style={{
                                                background: 'rgba(255,255,255,0.07)', border: '2px solid rgba(150,220,160,0.2)',
                                                borderRadius: 'var(--r-lg)', padding: '16px 18px',
                                                fontFamily: 'var(--ff-mono)', fontSize: '22px', fontWeight: 300,
                                                color: 'rgba(200,240,200,0.9)', textAlign: 'center',
                                                letterSpacing: '0.08em', width: '100%', outline: 'none',
                                                caretColor: 'rgba(150,220,160,0.8)',
                                            }}
                                            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(150,220,160,0.5)'; }}
                                            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(150,220,160,0.2)'; }}
                                        />
                                        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'rgba(150,200,160,0.35)', textAlign: 'center' }}>
                                            Answers are case-insensitive
                                        </div>

                                        {feedback && (
                                            <div style={{
                                                padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontFamily: 'var(--ff-ui)', fontWeight: 500,
                                                background: feedback.success ? 'rgba(150,220,160,0.12)' : 'rgba(184,96,78,0.12)',
                                                border: `1px solid ${feedback.success ? 'rgba(150,220,160,0.25)' : 'rgba(184,96,78,0.25)'}`,
                                                color: feedback.success ? 'rgba(150,220,160,0.9)' : 'rgba(210,120,100,0.9)',
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                            }}>
                                                {feedback.success ? <CheckCircle style={{ width: '15px', height: '15px' }} /> : <XCircle style={{ width: '15px', height: '15px' }} />}
                                                {feedback.message}
                                            </div>
                                        )}

                                        <button disabled={loading} className="jade-btn-primary" style={{ alignSelf: 'flex-start', opacity: loading ? 0.65 : 1, gap: '7px', display: 'flex', alignItems: 'center' }}>
                                            {loading
                                                ? <span className="spin" style={{ width: '13px', height: '13px', borderWidth: '2px', borderColor: 'rgba(150,220,160,0.3)', borderTopColor: 'rgba(150,220,160,0.9)' }} />
                                                : <Send style={{ width: '13px', height: '13px' }} />
                                            }
                                            {loading ? 'Casting spellâ€¦' : 'Cast Spell'}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Doodle zone */}
                            <div className="jade-doodle-zone">
                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(150,220,160,0.18)' }}>
                                    DOODLE ZONE Â· imperial dragons Â· jade pillars Â· cloud motifs
                                </span>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        );
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // DEFAULT (GLOBAL) THEME LAYOUT
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    return (
        <div>
            {/* Search bar */}
            <div className="g fade-in" style={{ padding: '12px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {searchBar}
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', flexShrink: 0 }}>
                    {filteredProblems.length}/{problems.length}
                </span>
            </div>

            <div className="problems-grid">

                {/* Sidebar */}
                <div className="g" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ink4)', padding: '12px 20px 8px', textTransform: 'uppercase', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        Problems
                    </div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {filteredProblems.map((problem: any, idx: number) => {
                        const status = getProblemStatus(problem.id);
                        const isSelected = selectedProblemId === problem.id;
                        return (
                            <button
                                key={problem.id}
                                className="prob-row"
                                onClick={() => selectProblem(problem.id)}
                                style={{
                                    width: '100%', border: 'none', cursor: 'pointer', borderRadius: 0, textAlign: 'left',
                                    background: isSelected ? 'var(--sage-bg)' : status === 'accepted' ? 'rgba(107,148,120,0.04)' : status === 'wrong' ? 'rgba(184,96,78,0.04)' : 'transparent',
                                    borderLeft: isSelected ? '3px solid var(--sage)' : '3px solid transparent',
                                    paddingLeft: isSelected ? '17px' : '20px',
                                }}
                            >
                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: isSelected ? 'var(--sage)' : 'var(--ink5)', width: '22px', flexShrink: 0 }}>
                                    {String.fromCharCode(65 + idx)}.
                                </span>
                                <span className="prob-title" style={{ color: isSelected ? 'var(--sage)' : 'var(--ink2)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                    {problem.title}
                                </span>
                                {status === 'accepted' && <CheckCircle style={{ width: '13px', height: '13px', color: 'var(--sage)', flexShrink: 0 }} />}
                                {status === 'wrong'    && <XCircle    style={{ width: '13px', height: '13px', color: 'var(--rose)', flexShrink: 0 }} />}
                            </button>
                        );
                    })}
                </div>

                {/* Main area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Problem header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div>
                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--ink4)', textTransform: 'uppercase', marginBottom: '4px' }}>
                                {activeStatus === 'accepted' ? 'âœ“ Solved' : activeStatus === 'wrong' ? 'âœ- Attempted' : 'Problem'}
                            </div>
                            <h2 style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: 'var(--ink)', lineHeight: 1.2 }}>
                                {activeProblem.title}
                            </h2>
                        </div>
                        <div style={{ flexShrink: 0, padding: '6px 14px', borderRadius: '8px', background: 'var(--sage-bg)', border: '1px solid var(--sage-border)', fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'var(--sage)', fontWeight: 600, marginTop: '2px' }}>
                            {activeProblem.points} pts
                        </div>
                    </div>

                    {/* Problem statement */}
                    <div className="g" style={{ padding: '24px 28px', whiteSpace: 'pre-wrap', fontFamily: 'var(--ff-body)', fontSize: '15px', lineHeight: 1.75, color: 'var(--ink2)' }}>
                        {activeProblem.statement}
                    </div>

                    {/* Submit */}
                    <div className="g" style={{ padding: '24px 28px' }}>
                        <div style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--ink)', marginBottom: '16px' }}>Submit Answer</div>

                        {activeStatus === 'accepted' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: 'var(--sage-bg)', border: '1px solid var(--sage-border)', borderRadius: '10px', color: 'var(--sage)', fontFamily: 'var(--ff-ui)', fontWeight: 500 }}>
                                <CheckCircle style={{ width: '18px', height: '18px' }} />
                                You&apos;ve solved this problem!
                            </div>
                        ) : (
                            <form onSubmit={submitAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Enter your answerâ€¦"
                                        className="input"
                                        value={answer}
                                        onChange={e => setAnswer(e.target.value)}
                                        required
                                        style={{ maxWidth: '360px' }}
                                    />
                                    <div style={{ marginTop: '6px', fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink4)' }}>
                                        Answers are case-insensitive
                                    </div>
                                </div>

                                {feedback && (
                                    <div style={{
                                        padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontFamily: 'var(--ff-ui)', fontWeight: 500,
                                        background: feedback.success ? 'var(--sage-bg)' : 'var(--rose-bg)',
                                        border: `1px solid ${feedback.success ? 'var(--sage-border)' : 'var(--rose-border)'}`,
                                        color: feedback.success ? 'var(--sage)' : 'var(--rose)',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                    }}>
                                        {feedback.success ? <CheckCircle style={{ width: '16px', height: '16px' }} /> : <XCircle style={{ width: '16px', height: '16px' }} />}
                                        {feedback.message}
                                    </div>
                                )}

                                <button disabled={loading} className="btn btn-ink" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '7px', opacity: loading ? 0.6 : 1 }}>
                                    {loading ? <span className="spin" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : <Send style={{ width: '14px', height: '14px' }} />}
                                    {loading ? 'Submittingâ€¦' : 'Submit'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
