'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Search, Award } from 'lucide-react';
import Link from 'next/link';

export function AdminBadgeManager({ 
    userId, 
    school, 
    memberGroups, 
    taughtGroups,
    userBadges = [],
    allBadges = [],
}: { 
    userId: string;
    school: any;
    memberGroups: any[];
    taughtGroups: any[];
    userBadges?: any[];
    allBadges?: any[];
}) {
    const router = useRouter();
    const [addingBadge, setAddingBadge] = useState<'school' | 'group' | 'custom' | null>(null);

    async function handleAction(action: string, targetId?: string) {
        if (!confirm(`Are you sure you want to ${action}?`)) return;
        
        try {
            const res = await fetch('/api/admin/users/badges', {
                method: 'PUT',
                body: JSON.stringify({ userId, action, targetId }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to update badge');
            } else {
                setAddingBadge(null);
                router.refresh();
            }
        } catch (err) {
            alert('An error occurred');
        }
    }

    async function handleAssignBadge(badgeId: string) {
        try {
            const res = await fetch('/api/admin/users/badges/custom', {
                method: 'POST',
                body: JSON.stringify({ userId, badgeId }),
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to assign badge');
            } else {
                setAddingBadge(null);
                router.refresh();
            }
        } catch {
            alert('An error occurred');
        }
    }

    async function handleRemoveBadge(badgeId: string) {
        if (!confirm('Remove this badge from the user?')) return;
        try {
            const res = await fetch('/api/admin/users/badges/custom', {
                method: 'DELETE',
                body: JSON.stringify({ userId, badgeId }),
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to remove badge');
            } else {
                router.refresh();
            }
        } catch {
            alert('An error occurred');
        }
    }

    // Filter out badges the user already has
    const userBadgeIds = new Set(userBadges.map((b: any) => b.id));
    const availableBadges = allBadges.filter((b: any) => !userBadgeIds.has(b.id));

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {/* School */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>
                        school:
                    </span>
                    {school && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--ff-mono)', fontSize: '10px', padding: '2px 4px 2px 9px', borderRadius: '99px', background: 'rgba(88,120,160,0.1)', border: '1px solid rgba(88,120,160,0.2)', color: 'var(--slate, #5878a0)', letterSpacing: '0.04em' }}>
                            <span>{school.shortName} · {school.district}</span>
                            <button onClick={() => handleAction('removeSchool')} title="Remove School" style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px', color: 'inherit', opacity: 0.6 }}>
                                <X size={10} />
                            </button>
                        </span>
                    )}
                    <div style={{ position: 'relative', display: 'flex' }}>
                        <button onClick={() => setAddingBadge(addingBadge === 'school' ? null : 'school')} className="btn btn-outline btn-xs" style={{ padding: '0 6px', fontSize: '10px', height: '22px', borderRadius: '99px', borderColor: 'rgba(0,0,0,0.1)' }}>
                            <Plus size={10} style={{ marginRight: '2px' }} /> School
                        </button>
                        {addingBadge === 'school' && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', zIndex: 100, minWidth: '240px' }}>
                                <SearchDropdown type="school" onSelect={(id) => handleAction('setSchool', id)} onClose={() => setAddingBadge(null)} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Groups */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>
                        groups:
                    </span>
                    {[...taughtGroups, ...memberGroups].slice(0, 10).map((g: any, idx: number) => {
                        const isTaught = taughtGroups.some((tg: any) => tg.id === g.id);
                        return (
                            <span key={g.id + idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--ff-mono)', fontSize: '10px', padding: '2px 4px 2px 9px', borderRadius: '99px', background: 'rgba(107,148,120,0.1)', border: '1px solid rgba(107,148,120,0.2)', color: 'var(--sage)', letterSpacing: '0.04em', textDecoration: 'none' }}>
                                <Link href={`/groups/${g.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                    {isTaught ? '📚 ' : ''}{g.name}
                                </Link>
                                {!isTaught && (
                                    <button onClick={() => handleAction('removeGroup', g.id)} title="Remove Group" style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px', color: 'inherit', opacity: 0.6 }}>
                                        <X size={10} />
                                    </button>
                                )}
                            </span>
                        );
                    })}
                    <div style={{ position: 'relative', display: 'flex' }}>
                        <button onClick={() => setAddingBadge(addingBadge === 'group' ? null : 'group')} className="btn btn-outline btn-xs" style={{ padding: '0 6px', fontSize: '10px', height: '22px', borderRadius: '99px', borderColor: 'rgba(0,0,0,0.1)' }}>
                            <Plus size={10} style={{ marginRight: '2px' }} /> Group
                        </button>
                        {addingBadge === 'group' && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', zIndex: 100, minWidth: '240px' }}>
                                <SearchDropdown type="group" onSelect={(id) => handleAction('addGroup', id)} onClose={() => setAddingBadge(null)} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Custom Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>
                        badges:
                    </span>
                    {userBadges.map((b: any) => (
                        <span
                            key={b.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontFamily: 'var(--ff-mono)',
                                fontSize: '10px',
                                letterSpacing: '0.06em',
                                padding: '2px 4px 2px 9px',
                                borderRadius: '99px',
                                background: b.textureUrl || 'rgba(107,148,120,0.12)',
                                color: b.textureUrl ? 'rgba(255,255,255,0.92)' : 'var(--sage)',
                                border: b.textureUrl ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--sage-border)',
                                textShadow: b.textureUrl ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                                fontWeight: 500,
                            }}
                        >
                            <span>✦ {b.name}</span>
                            <button
                                onClick={() => handleRemoveBadge(b.id)}
                                title="Remove badge"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    padding: '2px',
                                    color: 'inherit',
                                    opacity: 0.6,
                                }}
                            >
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                    {userBadges.length === 0 && (
                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>none</span>
                    )}
                    <div style={{ position: 'relative', display: 'flex' }}>
                        <button
                            onClick={() => setAddingBadge(addingBadge === 'custom' ? null : 'custom')}
                            className="btn btn-outline btn-xs"
                            style={{ padding: '0 6px', fontSize: '10px', height: '22px', borderRadius: '99px', borderColor: 'rgba(0,0,0,0.1)' }}
                        >
                            <Award size={10} style={{ marginRight: '2px' }} /> Badge
                        </button>
                        {addingBadge === 'custom' && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', zIndex: 100, minWidth: '260px' }}>
                                <BadgeDropdown
                                    badges={availableBadges}
                                    onSelect={(badgeId) => handleAssignBadge(badgeId)}
                                    onClose={() => setAddingBadge(null)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SearchDropdown({ type, onSelect, onClose }: { type: 'school' | 'group', onSelect: (id: string) => void, onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                if (type === 'school') {
                    const res = await fetch(`/api/schools?search=${encodeURIComponent(query)}&limit=10`);
                    if (res.ok) setResults(await res.json());
                } else {
                    const res = await fetch(`/api/groups`);
                    if (res.ok) {
                        const allGroups = await res.json();
                        setResults(allGroups.filter((g: any) => g.name.toLowerCase().includes(query.toLowerCase())).slice(0, 10));
                    }
                }
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query, type]);

    return (
        <div ref={ref} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: 'var(--shadow-lg)', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: '8px', color: 'var(--ink5)' }} />
                <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder={`Search ${type}...`} className="input" style={{ paddingLeft: '28px', width: '100%', fontSize: '12px' }} />
            </div>
            {loading && <div style={{ fontSize: '11px', color: 'var(--ink5)', padding: '4px 8px' }}>Loading...</div>}
            {!loading && results.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '200px', overflowY: 'auto' }}>
                    {results.map(r => (
                        <button key={r.id} onClick={() => onSelect(r.id)} style={{ textAlign: 'left', background: 'transparent', border: 'none', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', fontSize: '11px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{type === 'school' ? r.shortName : r.name}</span>
                            <span style={{ fontSize: '10px', color: 'var(--ink5)' }}>{type === 'school' ? r.district : r.school?.shortName}</span>
                        </button>
                    ))}
                </div>
            )}
            {!loading && query && results.length === 0 && <div style={{ fontSize: '11px', color: 'var(--ink5)', padding: '4px 8px' }}>No results.</div>}
        </div>
    );
}

function BadgeDropdown({ badges, onSelect, onClose }: { badges: any[]; onSelect: (badgeId: string) => void; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const filtered = badges.filter((b: any) =>
        b.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div
            ref={ref}
            style={{
                background: 'var(--bg)',
                border: '1px solid var(--border, rgba(0,0,0,0.08))',
                borderRadius: 'var(--r)',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
            }}
        >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: '8px', color: 'var(--ink5)' }} />
                <input
                    autoFocus
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search badges..."
                    className="input"
                    style={{ paddingLeft: '28px', width: '100%', fontSize: '12px' }}
                />
            </div>
            {filtered.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '220px', overflowY: 'auto', gap: '2px' }}>
                    {filtered.map((b: any) => (
                        <button
                            key={b.id}
                            onClick={() => onSelect(b.id)}
                            style={{
                                textAlign: 'left',
                                background: 'transparent',
                                border: 'none',
                                padding: '7px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontFamily: 'var(--ff-mono)',
                                    fontSize: '10px',
                                    letterSpacing: '0.06em',
                                    padding: '2px 9px',
                                    borderRadius: '99px',
                                    background: b.textureUrl || 'rgba(107,148,120,0.12)',
                                    color: b.textureUrl ? 'rgba(255,255,255,0.92)' : 'var(--sage)',
                                    border: b.textureUrl ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--sage-border)',
                                    textShadow: b.textureUrl ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                                    fontWeight: 500,
                                }}
                            >
                                ✦ {b.name}
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <div style={{ fontSize: '11px', color: 'var(--ink5)', padding: '4px 8px' }}>
                    {badges.length === 0 ? 'No badges available. Create badges in Admin dashboard.' : 'No matching badges.'}
                </div>
            )}
        </div>
    );
}
