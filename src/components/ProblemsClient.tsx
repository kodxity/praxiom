'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

function getPointsLabel(pts: number) {
    if (pts <= 80)  return { label: 'E', title: 'Easy',   cls: 'diff-e' }
    if (pts <= 120) return { label: 'M', title: 'Medium', cls: 'diff-m' }
    if (pts <= 200) return { label: 'H', title: 'Hard',   cls: 'diff-h' }
    return              { label: 'X', title: 'Expert', cls: 'diff-x' }
}

function inferTopic(title: string): string {
    const t = title.toLowerCase();
    if (/prime|divis|gcd|lcm|modular|residue|congruence|factor|coprime/i.test(t)) return 'Number Theory';
    if (/combinat|permut|count|path|graph|tree|color|arrangement/i.test(t)) return 'Combinatorics';
    if (/triangle|circle|polygon|area|angle|length|geometry|chord|tangent/i.test(t)) return 'Geometry';
    if (/equation|polynomial|root|sequence|series|sum|product|function|algebra/i.test(t)) return 'Algebra';
    if (/inequalit|bound|maximum|minimum|optim|extreme/i.test(t)) return 'Inequalities';
    return '';
}

const TOPICS = ['Number Theory', 'Combinatorics', 'Geometry', 'Algebra', 'Inequalities'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert'];

interface Problem {
    id: string
    title: string
    points: number
    contestId: string
    contest: { id: string; title: string }
    _count: { submissions: number }
}

interface ProblemsClientProps {
    problems: Problem[]
    solvedIds: string[]
}

export function ProblemsClient({ problems, solvedIds }: ProblemsClientProps) {
    const [search, setSearch]     = useState('');
    const [topic, setTopic]       = useState('');
    const [difficulty, setDiff]   = useState('');
    const [contest, setContest]   = useState('');

    const solvedSet = new Set(solvedIds);

    // Unique contest list
    const contests = useMemo(() => {
        const seen = new Set<string>();
        return problems.map(p => p.contest.title).filter(t => { if (seen.has(t)) return false; seen.add(t); return true; });
    }, [problems]);

    const filtered = useMemo(() => problems.filter(p => {
        const q = search.toLowerCase();
        if (q && !p.title.toLowerCase().includes(q) && !p.contest.title.toLowerCase().includes(q)) return false;
        if (topic && inferTopic(p.title) !== topic) return false;
        if (difficulty) {
            const d = getPointsLabel(p.points).title;
            if (d !== difficulty) return false;
        }
        if (contest && p.contest.title !== contest) return false;
        return true;
    }), [problems, search, topic, difficulty, contest]);

    return (
        <div className="fade-in-d" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

            {/* Filter bar - Section B */}
            <div className="g" style={{ padding: '16px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div className="search-wrap" style={{ flex: 1, minWidth: '180px' }}>
                    <svg className="search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className="input input-search"
                        placeholder="Search problems, topics, lore…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
                <select className="select" style={{ width: '140px' }} value={topic} onChange={e => setTopic(e.target.value)}>
                    <option value="">All Topics</option>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="select" style={{ width: '120px' }} value={difficulty} onChange={e => setDiff(e.target.value)}>
                    <option value="">Difficulty</option>
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="select" style={{ width: '140px' }} value={contest} onChange={e => setContest(e.target.value)}>
                    <option value="">All Contests</option>
                    {contests.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="tag" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Problem list */}
            {filtered.length === 0 ? (
                <div className="g" style={{ padding: 0 }}>
                    <div className="empty">
                        <div className="empty-title">No matches</div>
                        <div className="empty-body">Try adjusting your filters.</div>
                    </div>
                </div>
            ) : (
                <div className="g" style={{ overflow: 'hidden' }}>

                    {/* Table header */}
                    <div style={{
                        padding: '12px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)',
                        display: 'grid', gridTemplateColumns: '40px 20px 1fr 200px 70px 64px 48px',
                        gap: '12px', alignItems: 'center',
                        fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.12em',
                        color: 'var(--ink5)', textTransform: 'uppercase',
                    }}>
                        <span>#</span>
                        <span />
                        <span>Title</span>
                        <span>Contest</span>
                        <span style={{ textAlign: 'right' }}>Attempts</span>
                        <span style={{ textAlign: 'right' }}>Points</span>
                        <span />
                    </div>

                    {/* Rows */}
                    {filtered.map((problem, idx) => {
                        const diff = getPointsLabel(problem.points);
                        const isSolved = solvedSet.has(problem.id);

                        return (
                            <Link
                                key={problem.id}
                                href={`/contests/${problem.contestId}/problems/${problem.id}`}
                                className="prob-row"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '40px 20px 1fr 200px 70px 64px 48px',
                                    gap: '12px',
                                    alignItems: 'center',
                                    padding: '13px 20px',
                                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                                    textDecoration: 'none',
                                    animation: 'fade-in 0.4s both',
                                    animationDelay: `${idx * 0.025}s`,
                                    background: isSolved ? 'rgba(107,148,120,0.04)' : 'transparent',
                                }}
                            >
                                <span className="prob-num" style={{ color: 'var(--ink5)' }}>
                                    {String(idx + 1).padStart(3, '0')}
                                </span>
                                <div className={`diff-dot ${diff.cls}`} title={diff.title} style={{ flexShrink: 0 }} />
                                <span className="prob-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {problem.title}
                                </span>
                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {problem.contest.title}
                                </span>
                                <span className="prob-rate" style={{ textAlign: 'right' }}>
                                    {problem._count.submissions > 0 ? problem._count.submissions : '-'}
                                </span>
                                <span className="prob-xp" style={{ textAlign: 'right' }}>
                                    +{problem.points} XP
                                </span>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    {isSolved && <span className="solved-icon" title="Solved">✓</span>}
                                </div>
                            </Link>
                        );
                    })}

                </div>
            )}
        </div>
    );
}
