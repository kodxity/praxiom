'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Lock } from 'lucide-react';

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
            <div className="g" style={{ padding: '12px 18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
                <select className="select" style={{ width: '120px' }} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    <option value="">Difficulty</option>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Expert</option>
                </select>
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