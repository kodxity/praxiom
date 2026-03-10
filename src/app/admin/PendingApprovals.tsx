'use client';
import { useState, useMemo } from 'react';
import { UserApproval } from './UserApproval';

export function PendingApprovals({ users }: { users: any[] }) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (!query.trim()) return users;
        const q = query.toLowerCase();
        return users.filter(u =>
            u.username.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.displayName?.toLowerCase().includes(q) ||
            u.school?.shortName?.toLowerCase().includes(q) ||
            u.school?.district?.toLowerCase().includes(q)
        );
    }, [users, query]);

    return (
        <>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <p className="sec-label" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                        Pending Approvals
                    </p>
                    {users.length > 0 && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            minWidth: '20px', height: '20px', borderRadius: '99px',
                            background: 'rgba(220,60,60,0.12)', color: 'rgba(200,50,50,0.9)',
                            fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 700, padding: '0 5px',
                        }}>
                            {users.length}
                        </span>
                    )}
                </div>

                {/* Search - only shown when there are enough users to warrant it */}
                {users.length > 3 && (
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by name, email, school…"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            style={{
                                fontFamily: 'var(--ff-mono)',
                                fontSize: '12px',
                                background: 'rgba(0,0,0,0.03)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--r)',
                                padding: '7px 32px 7px 12px',
                                color: 'var(--ink)',
                                outline: 'none',
                                width: '240px',
                                transition: 'border-color 0.15s',
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = 'var(--sage)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                style={{
                                    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--ink5)', fontSize: '14px', lineHeight: 1, padding: '2px',
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Filter result label */}
            {query.trim() && (
                <p style={{
                    fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.08em',
                    color: 'var(--ink5)', marginBottom: '10px', textTransform: 'uppercase',
                }}>
                    {filtered.length} of {users.length} matching &ldquo;{query}&rdquo;
                </p>
            )}

            {/* List */}
            {users.length === 0 ? (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    padding: '40px 20px', color: 'var(--ink5)',
                    fontFamily: 'var(--ff-mono)', fontSize: '12px', textAlign: 'center',
                }}>
                    <span style={{ fontSize: '22px', opacity: 0.35 }}>✓</span>
                    All caught up - no pending users.
                </div>
            ) : filtered.length === 0 ? (
                <div style={{
                    padding: '32px 20px', textAlign: 'center',
                    color: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: '12px',
                }}>
                    No results for &ldquo;{query}&rdquo;
                </div>
            ) : (
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    maxHeight: '480px', overflowY: 'auto', paddingRight: '4px',
                }}>
                    {filtered.map((user: any) => (
                        <UserApproval key={user.id} user={user} />
                    ))}
                </div>
            )}
        </>
    );
}
