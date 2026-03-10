'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, AlertCircle, ChevronLeft, GraduationCap, BookOpen, Search, X, Eye, EyeOff } from 'lucide-react';
import CustomSelect from '@/components/CustomSelect';

type School = { id: string; name: string; shortName: string; district: string; emailDomain: string | null };
type Group  = { id: string; name: string; teacher: { username: string } };

function SchoolSearch({
    value, onSelect, required, placeholder
}: {
    value: School | null;
    onSelect: (s: School | null) => void;
    required?: boolean;
    placeholder?: string;
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<School[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const search = useCallback((q: string) => {
        if (!q.trim()) { setResults([]); setOpen(false); return; }
        setLoading(true);
        fetch(`/api/schools?search=${encodeURIComponent(q)}&limit=12`)
            .then(r => r.json())
            .then((data: School[]) => { setResults(data); setOpen(true); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
        const q = e.target.value;
        setQuery(q);
        if (value) onSelect(null); // clear selection on new typing
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => search(q), 250);
    }

    function pick(s: School) {
        onSelect(s);
        setQuery(s.name);
        setOpen(false);
        setResults([]);
    }

    function clear() {
        onSelect(null);
        setQuery('');
        setResults([]);
        setOpen(false);
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box',
        paddingLeft: '34px', paddingRight: value ? '34px' : '10px',
    };

    return (
        <div ref={wrapRef} style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                <Search size={13} style={{ color: 'var(--ink5)' }} />
            </span>
            <input
                className="input"
                style={inputStyle}
                value={query}
                onChange={handleInput}
                onFocus={() => { if (results.length > 0) setOpen(true); }}
                placeholder={placeholder ?? 'Type to search schools…'}
                autoComplete="off"
                required={required && !value}
            />
            {value && (
                <button type="button" onClick={clear} tabIndex={-1}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: 'var(--ink4)' }}>
                    <X size={13} />
                </button>
            )}
            {/* Hidden real input to satisfy form required */}
            {required && <input type="hidden" value={value?.id ?? ''} required={required} />}

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
                    background: 'var(--glass-strong)', backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--r)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    maxHeight: '260px', overflowY: 'auto',
                }}>
                    {loading && (
                        <div style={{ padding: '10px 14px', fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)' }}>Searching…</div>
                    )}
                    {!loading && results.length === 0 && query.trim() && (
                        <div style={{ padding: '10px 14px', fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)' }}>No schools found</div>
                    )}
                    {results.map(sc => (
                        <button
                            key={sc.id}
                            type="button"
                            onMouseDown={() => pick(sc)}
                            style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: '8px 14px', borderBottom: '1px solid var(--glass-border)',
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(107,148,120,0.12)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <div style={{ fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>{sc.name}</div>
                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', marginTop: '1px' }}>
                                {sc.shortName} · {sc.district}
                                {sc.emailDomain ? ` · @${sc.emailDomain}` : ''}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [isTeacher, setIsTeacher] = useState<boolean | null>(null);
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const [groups, setGroups] = useState<Group[]>([]);

    const [form, setForm] = useState({
        username: '',
        displayName: '',
        email: '',
        password: '',
        schoolId: '',
        groupId: '',
        groupName: '',
        message: '',
    });

    // Load groups when school changes
    useEffect(() => {
        if (!selectedSchool) { setGroups([]); return; }
        fetch(`/api/groups?schoolId=${selectedSchool.id}`).then(r => r.json()).then(setGroups).catch(() => {});
    }, [selectedSchool]);

    function handleSchoolSelect(school: School | null) {
        setSelectedSchool(school);
        setForm(prev => ({ ...prev, schoolId: school?.id ?? '', groupId: '' }));
    }

    function field(key: keyof typeof form, val: string) {
        setForm(prev => ({ ...prev, [key]: val }));
    }

    function chooseRole(teacher: boolean) {
        setIsTeacher(teacher);
        setDirection('forward');
        setStep(2);
    }

    function goBack() {
        setDirection('back');
        setStep(1);
        setError('');
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, isTeacher: isTeacher ?? false }),
        });

        if (res.ok) {
            router.push('/login?registered=true');
        } else {
            const json = await res.json();
            setError(json.message || 'Registration failed.');
            setLoading(false);
        }
    }

    const requireDomain = !!selectedSchool?.emailDomain;

    const labelStyle: React.CSSProperties = {
        fontFamily: 'var(--ff-ui)', fontSize: '12px', fontWeight: 600,
        letterSpacing: '0.06em', color: 'var(--ink3)', textTransform: 'uppercase',
    };
    const fieldWrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px' };
    const hint: React.CSSProperties = { fontSize: '11px', color: 'var(--ink5)', fontFamily: 'var(--ff-mono)' };

    return (
        <div style={{ position: 'relative', zIndex: 1, minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.75rem' }}>
            <div className="g scale-in" style={{ width: '100%', maxWidth: step === 1 ? '480px' : '460px', padding: 'clamp(20px, 5vw, 40px)', transition: 'max-width 0.3s ease' }}>

                {/* Wordmark */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <img src="/icon.svg" alt="Praxiom logo" style={{ width: '24px', height: '24px', display: 'block' }} />
                        <span style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', fontWeight: 400, color: 'var(--ink)' }}>Praxi</span>
                        <em style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', fontStyle: 'italic', color: 'var(--sage)' }}>om</em>
                    </Link>

                    {step === 1 ? (
                        <>
                            <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', fontWeight: 400, color: 'var(--ink)', marginTop: '18px', marginBottom: '6px', lineHeight: 1.1 }}>
                                Join Praxiom
                            </h1>
                            <p style={{ fontSize: '14px', color: 'var(--ink4)', fontWeight: 300 }}>Who are you signing up as?</p>
                        </>
                    ) : (
                        <>
                            <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', fontWeight: 400, color: 'var(--ink)', marginTop: '18px', marginBottom: '4px', lineHeight: 1.1 }}>
                                {isTeacher ? 'Teacher sign-up' : 'Student sign-up'}
                            </h1>
                            <p style={{ fontSize: '13px', color: 'var(--ink5)', fontWeight: 300 }}>
                                Your name and email are only visible to admins and your teacher - never shown publicly.
                            </p>
                        </>
                    )}
                </div>

                {/* Step 1: pick role */}
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={() => chooseRole(false)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '16px',
                                padding: '18px 20px', borderRadius: 'var(--r)',
                                background: 'transparent', border: '1.5px solid var(--border)',
                                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--sage)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                        >
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--sage-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <GraduationCap size={18} style={{ color: 'var(--sage)' }} />
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '15px', color: 'var(--ink)', marginBottom: '3px' }}>Student</div>
                                <div style={{ fontSize: '12px', color: 'var(--ink4)', lineHeight: 1.4 }}>Join your school's group or sign up independently</div>
                            </div>
                        </button>

                        <button
                            onClick={() => chooseRole(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '16px',
                                padding: '18px 20px', borderRadius: 'var(--r)',
                                background: 'transparent', border: '1.5px solid var(--border)',
                                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--sage)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                        >
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--slate-bg, rgba(88,120,160,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <BookOpen size={18} style={{ color: 'var(--slate, #5878a0)' }} />
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '15px', color: 'var(--ink)', marginBottom: '3px' }}>Teacher</div>
                                <div style={{ fontSize: '12px', color: 'var(--ink4)', lineHeight: 1.4 }}>Create a group for your students - requires admin approval</div>
                            </div>
                        </button>

                        <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px', color: 'var(--ink4)' }}>
                            Already have an account?{' '}
                            <Link href="/login" style={{ color: 'var(--sage)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
                        </p>
                    </div>
                )}

                {/* Step 2: details */}
                {step === 2 && (
                    <>
                        {error && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px', background: 'var(--rose-bg)', border: '1px solid var(--rose-border)', borderRadius: 'var(--r)', marginBottom: '16px' }}>
                                <AlertCircle size={15} style={{ color: 'var(--rose)', flexShrink: 0, marginTop: '1px' }} />
                                <span style={{ fontSize: '13px', color: 'var(--rose)', lineHeight: 1.5 }}>{error}</span>
                            </div>
                        )}

                        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={fieldWrap}>
                                <label style={labelStyle}>Username</label>
                                <input value={form.username} onChange={e => field('username', e.target.value)} name="username" required autoComplete="username" className="input" placeholder="choose a handle" />
                                <span style={hint}>Shown publicly on your profile · <strong style={{ fontWeight: 600, color: 'var(--ink4)' }}>case-sensitive</strong> and used to log in</span>
                            </div>

                            <div style={fieldWrap}>
                                <label style={labelStyle}>Full name</label>
                                <input value={form.displayName} onChange={e => field('displayName', e.target.value)} name="displayName" required className="input" placeholder="Your real name" />
                                <span style={hint}>Only visible to admins{!isTeacher ? ' and your teacher' : ''} - never shown on your profile</span>
                            </div>

                            {/* School picker */}
                            <div style={fieldWrap}>
                                <label style={labelStyle}>School <span style={{ fontWeight: 400, color: 'var(--ink5)', textTransform: 'none', letterSpacing: 0 }}>{isTeacher ? '' : '(optional)'}</span></label>
                                <SchoolSearch
                                    value={selectedSchool}
                                    onSelect={handleSchoolSelect}
                                    required={isTeacher ?? false}
                                    placeholder={isTeacher ? 'Search your school…' : 'Search schools (optional)…'}
                                />
                                {selectedSchool && (
                                    <span style={hint}>{selectedSchool.district}{selectedSchool.emailDomain ? ` · @${selectedSchool.emailDomain}` : ''}</span>
                                )}
                            </div>

                            {/* Group picker (students) or group name (teachers) */}
                            {!isTeacher && form.schoolId && (
                                <div style={fieldWrap}>
                                    <label style={labelStyle}>Group <span style={{ fontWeight: 400, color: 'var(--ink5)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                                    <CustomSelect
                                        value={form.groupId}
                                        onChange={val => field('groupId', val)}
                                        options={[
                                            { value: '', label: '- None -' },
                                            ...groups.map(g => ({ value: g.id, label: `${g.name} (by ${g.teacher.username})` }))
                                        ]}
                                        placeholder="- None -"
                                        variant="field"
                                        style={{ width: '100%' }}
                                    />
                                    {groups.length === 0 && <span style={hint}>No groups yet at this school</span>}
                                </div>
                            )}

                            {isTeacher && (
                                <div style={fieldWrap}>
                                    <label style={labelStyle}>Group name</label>
                                    <input value={form.groupName} onChange={e => field('groupName', e.target.value)} name="groupName" required className="input" placeholder="e.g. Math Club 2026" />
                                    <span style={hint}>Students will join this group</span>
                                </div>
                            )}

                            {/* Email */}
                            <div style={fieldWrap}>
                                <label style={labelStyle}>
                                    Email{' '}
                                    <span style={{ fontWeight: 400, color: 'var(--ink5)', textTransform: 'none', letterSpacing: 0 }}>
                                        {!isTeacher && requireDomain ? `(must end in @${selectedSchool?.emailDomain})` : '(optional)'}
                                    </span>
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => field('email', e.target.value)}
                                    name="email"
                                    required={!isTeacher && requireDomain}
                                    autoComplete="email"
                                    className="input"
                                    placeholder={!isTeacher && requireDomain ? `you@${selectedSchool?.emailDomain}` : 'your@email.com'}
                                />
                                <span style={hint}>Private - only visible to admin{!isTeacher ? ' and your teacher' : ''}</span>
                            </div>

                            <div style={fieldWrap}>
                                <label style={labelStyle}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input value={form.password} onChange={e => field('password', e.target.value)} name="password" type={showPw ? 'text' : 'password'} required autoComplete="new-password" className="input" placeholder="min. 6 characters" minLength={6} style={{ paddingRight: '40px' }} />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPw(p => !p)}
                                        aria-label={showPw ? 'Hide password' : 'Show password'}
                                        style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--ink5)', display: 'flex', alignItems: 'center', lineHeight: 0 }}
                                    >
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div style={fieldWrap}>
                                <label style={labelStyle}>
                                    About you{' '}
                                    <span style={{ fontWeight: 400, color: 'var(--ink5)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                                </label>
                                <textarea
                                    value={form.message}
                                    onChange={e => field('message', e.target.value)}
                                    name="message"
                                    rows={3}
                                    maxLength={500}
                                    className="input"
                                    placeholder={isTeacher
                                        ? 'e.g. I coach AMC/AIME prep at Lincoln High - looking forward to building a team!'
                                        : 'e.g. I compete in AMC 10/12 and love combinatorics. Excited to join!'
                                    }
                                    style={{ resize: 'vertical', minHeight: '72px', lineHeight: 1.5 }}
                                />
                                <span style={hint}>
                                    {isTeacher
                                        ? 'Shown to admins when reviewing your account'
                                        : 'Visible to your teacher and admins - helps them know who you are'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-sage"
                                    style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: '8px', opacity: loading ? 0.7 : 1 }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spin" style={{ width: '14px', height: '14px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                                            Creating account…
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={15} />
                                            Create account
                                        </>
                                    )}
                                </button>

                                <button type="button" onClick={goBack} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: '6px', fontSize: '13px' }}>
                                    <ChevronLeft size={14} />
                                    Back
                                </button>
                            </div>
                        </form>

                        <div style={{ marginTop: '14px', padding: '11px 14px', background: 'rgba(0,0,0,0.03)', borderRadius: 'var(--r)', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <p style={{ fontSize: '11px', color: 'var(--ink5)', lineHeight: 1.55, fontFamily: 'var(--ff-mono)', textAlign: 'center', margin: 0 }}>
                                {isTeacher
                                    ? 'Teacher accounts are manually approved by an admin before you can log in.'
                                    : form.groupId
                                        ? 'Your teacher will approve your sign-up request before you can log in.'
                                        : 'Independent accounts are approved by an admin before you can log in.'}
                            </p>
                        </div>

                        <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '13px', color: 'var(--ink4)' }}>
                            Already have an account?{' '}
                            <Link href="/login" style={{ color: 'var(--sage)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
                        </p>
                    </>
                )}

            </div>
        </div>
    );
}
