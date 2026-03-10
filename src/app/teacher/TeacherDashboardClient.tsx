'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, ClipboardList, BarChart2, CheckCircle, XCircle } from 'lucide-react';

type Group = { id: string; name: string; bio: string | null; school: { name: string; shortName: string; district: string } | null };
type PendingUser = { id: string; username: string; displayName: string | null; email: string | null; createdAt: string; school: { shortName: string } | null; kind: 'account' | 'join' };
type Student = { id: string; username: string; rating: number; createdAt: string; _count: { submissions: number } };
type ContestResult = { contest: { id: string; title: string; endTime: string }; results: { username: string; change: number; newRating: number }[] };

type Tab = 'pending' | 'students' | 'results';

export function TeacherDashboardClient({ group, embedded = false }: { group: Group; embedded?: boolean }) {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('pending');
    const [pending, setPending] = useState<PendingUser[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [results, setResults] = useState<ContestResult[]>([]);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [addUsername, setAddUsername] = useState('');
    const [addError, setAddError] = useState('');

    const fetchPending  = useCallback(() => fetch('/api/teacher/pending').then(r => r.json()).then(setPending).catch(() => {}), []);
    const fetchStudents = useCallback(() => fetch('/api/teacher/students').then(r => r.json()).then(setStudents).catch(() => {}), []);
    const fetchResults  = useCallback(() => fetch('/api/teacher/contest-results').then(r => r.json()).then(setResults).catch(() => {}), []);

    useEffect(() => { fetchPending(); }, [fetchPending]);
    useEffect(() => { if (tab === 'students') fetchStudents(); }, [tab, fetchStudents]);
    useEffect(() => { if (tab === 'results')  fetchResults();  }, [tab, fetchResults]);

    async function act(userId: string, action: 'approve' | 'deny' | 'approve_request' | 'deny_request' | 'remove') {
        setLoadingAction(userId + action);
        await fetch('/api/teacher/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action }),
        });
        setLoadingAction(null);
        fetchPending();
        if (tab === 'students') fetchStudents();
        router.refresh();
    }

    async function addStudent() {
        const username = addUsername.trim();
        if (!username) return;
        setAddError('');
        setLoadingAction('add');
        const res = await fetch('/api/teacher/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add', username }),
        });
        setLoadingAction(null);
        if (!res.ok) {
            const json = await res.json().catch(() => null);
            setAddError(json?.error || 'Unable to add user');
            return;
        }
        setAddUsername('');
        fetchStudents();
        router.refresh();
    }

    function getRatingColor(rating: number) {
        if (rating >= 2400) return 'var(--amber)';
        if (rating >= 2000) return 'var(--violet)';
        if (rating >= 1600) return 'var(--slate)';
        if (rating >= 1400) return 'var(--sage)';
        return 'var(--ink3)';
    }

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: active ? 600 : 400,
        background: active ? 'white' : 'transparent',
        color: active ? 'var(--ink)' : 'var(--ink4)',
        boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.15s',
    });

    return (
        <div style={{ maxWidth: embedded ? '100%' : '1000px', margin: '0 auto', padding: embedded ? '0' : '48px 1.75rem 80px' }}>

            {/* Header */}
            {!embedded && (
                <div style={{ marginBottom: '36px' }}>
                    <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '10px', textTransform: 'uppercase' }}>
                        Teacher · Dashboard
                    </p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h1 style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '32px', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                                {group.name}
                            </h1>
                            {group.school && (
                                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink4)' }}>
                                    {group.school.name} · {group.school.district}
                                </p>
                            )}
                        </div>
                        <Link
                            href={`/groups/${group.id}`}
                            className="btn btn-ghost btn-sm"
                            style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px' }}
                        >
                            View group page →
                        </Link>
                    </div>
                </div>
            )}

            {/* Tab bar */}
            <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(0,0,0,0.04)', borderRadius: '10px', marginBottom: '24px', width: 'fit-content' }}>
                <button onClick={() => setTab('pending')} style={tabStyle(tab === 'pending')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ClipboardList size={14} />
                        Pending
                        {pending.length > 0 && (
                            <span style={{ minWidth: '18px', height: '18px', borderRadius: '99px', background: 'rgba(220,60,60,0.15)', color: 'rgba(200,50,50,0.9)', fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                                {pending.length}
                            </span>
                        )}
                    </span>
                </button>
                <button onClick={() => setTab('students')} style={tabStyle(tab === 'students')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} />
                        Students
                    </span>
                </button>
                <button onClick={() => setTab('results')} style={tabStyle(tab === 'results')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BarChart2 size={14} />
                        Contest Results
                    </span>
                </button>
            </div>

            {/* Pending tab */}
            {tab === 'pending' && (
                <div className="g" style={{ padding: '24px 28px' }}>
                    <p className="sec-label" style={{ marginBottom: '16px' }}>Pending Requests</p>
                    {pending.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '32px 20px', color: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: '12px', textAlign: 'center' }}>
                            <span style={{ fontSize: '20px', opacity: 0.4 }}>✓</span>
                            No pending applications.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {pending.map(u => (
                                <div key={u.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: 'var(--r)', background: 'rgba(0,0,0,0.025)', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(107,148,120,0.12)', border: '1px solid rgba(107,148,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--sage)', flexShrink: 0, marginTop: '1px' }}>
                                        {u.username.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--ink)', marginBottom: '2px' }}>
                                            {u.username}
                                        </div>
                                        {u.displayName && <div style={{ fontSize: '12px', color: 'var(--ink3)' }}>{u.displayName}</div>}
                                        {u.email     && <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)' }}>{u.email}</div>}
                                        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink6, var(--ink5))', marginTop: '4px' }}>
                                            {u.kind === 'join' ? 'Requested' : 'Applied'} {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        {u.kind === 'join' && (
                                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.08em', color: 'var(--ink5)', marginTop: '6px', textTransform: 'uppercase' }}>
                                                Join request
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                                        <button
                                            onClick={() => act(u.id, u.kind === 'join' ? 'approve_request' : 'approve')}
                                            disabled={loadingAction !== null}
                                            className="btn btn-sage btn-sm"
                                            style={{ opacity: loadingAction !== null ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            <CheckCircle size={13} />
                                            {loadingAction === u.id + (u.kind === 'join' ? 'approve_request' : 'approve') ? '…' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => act(u.id, u.kind === 'join' ? 'deny_request' : 'deny')}
                                            disabled={loadingAction !== null}
                                            className="btn btn-ghost btn-sm"
                                            style={{ opacity: loadingAction !== null ? 0.6 : 1, color: 'var(--rose, #c03030)', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            <XCircle size={13} />
                                            {loadingAction === u.id + (u.kind === 'join' ? 'deny_request' : 'deny') ? '…' : 'Deny'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Students tab */}
            {tab === 'students' && (
                <div className="g" style={{ padding: '24px 28px' }}>
                    <p className="sec-label" style={{ marginBottom: '16px' }}>
                        Students · {students.length} member{students.length !== 1 ? 's' : ''}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                        <input
                            className="input"
                            placeholder="Add student by username"
                            value={addUsername}
                            onChange={e => setAddUsername(e.target.value)}
                            style={{ maxWidth: '260px' }}
                        />
                        <button
                            className="btn btn-sage btn-sm"
                            onClick={addStudent}
                            disabled={loadingAction !== null || addUsername.trim().length === 0}
                            style={{ opacity: loadingAction !== null ? 0.6 : 1 }}
                        >
                            Add student
                        </button>
                        {addError && <span style={{ fontSize: '12px', color: 'var(--rose, #c03030)' }}>{addError}</span>}
                    </div>
                    {students.length === 0 ? (
                        <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: '12px' }}>
                            No approved students yet.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--ff-ui)', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        {['#', 'Username', 'Rating', 'Submissions', 'Joined', ''].map(h => (
                                            <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ink5)', fontWeight: 400, textTransform: 'uppercase' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((s, i) => (
                                        <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '10px 12px', fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink5)' }}>{i + 1}</td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <Link href={`/user/${s.username}`} style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                                                    {s.username}
                                                </Link>
                                            </td>
                                            <td style={{ padding: '10px 12px', fontFamily: 'var(--ff-mono)', fontSize: '13px', fontWeight: 600, color: getRatingColor(s.rating) }}>
                                                {s.rating}
                                            </td>
                                            <td style={{ padding: '10px 12px', fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink4)' }}>{s._count.submissions}</td>
                                            <td style={{ padding: '10px 12px', fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)' }}>
                                                {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--rose, #c03030)' }}
                                                    onClick={() => act(s.id, 'remove')}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Contest results tab */}
            {tab === 'results' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {results.length === 0 ? (
                        <div className="g" style={{ padding: '32px', textAlign: 'center', color: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: '12px' }}>
                            No contest results yet for your students.
                        </div>
                    ) : results.map(cr => (
                        <div key={cr.contest.id} className="g" style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                    <div style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '15px', color: 'var(--ink)' }}>{cr.contest.title}</div>
                                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)', marginTop: '2px' }}>
                                        {new Date(cr.contest.endTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                                <Link href={`/contests/${cr.contest.id}/standings`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--sage)', textDecoration: 'none' }}>
                                    Full standings →
                                </Link>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                                {cr.results.sort((a, b) => b.newRating - a.newRating).map(r => (
                                    <div key={r.username} style={{ padding: '10px 14px', borderRadius: 'var(--r)', background: 'rgba(0,0,0,0.025)', border: '1px solid var(--border)' }}>
                                        <div style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '13px', color: 'var(--ink)', marginBottom: '4px' }}>
                                            <Link href={`/user/${r.username}`} style={{ color: 'inherit', textDecoration: 'none' }}>{r.username}</Link>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '14px', fontWeight: 600, color: getRatingColor(r.newRating) }}>{r.newRating}</span>
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: r.change >= 0 ? 'var(--sage)' : 'var(--rose, #c03030)' }}>
                                                {r.change >= 0 ? '+' : ''}{r.change}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
