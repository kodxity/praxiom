'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { LogIn, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const registered = searchParams.get('registered');

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');
        const formData = new FormData(e.currentTarget);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        const res = await signIn('credentials', { username, password, redirect: false });

        if (res?.error) {
            setError('Invalid username or password.');
            setLoading(false);
        } else {
            router.push('/');
            router.refresh();
        }
    }

    return (
        <div style={{ position: 'relative', zIndex: 1, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.75rem' }}>
            <div className="g scale-in" style={{ width: '100%', maxWidth: '420px', padding: 'clamp(24px, 5vw, 40px)' }}>

                {/* Wordmark */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'baseline', gap: '0' }}>
                        <span style={{ fontFamily: 'var(--ff-display)', fontSize: '20px', fontStyle: 'italic', color: 'var(--sage)', marginRight: '3px' }}>Σ</span>
                        <span style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', fontWeight: 400, color: 'var(--ink)' }}>Praxi</span>
                        <em style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', fontStyle: 'italic', color: 'var(--sage)' }}>s</em>
                    </Link>
                    <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '28px', fontWeight: 400, color: 'var(--ink)', marginTop: '20px', marginBottom: '6px', lineHeight: 1.1 }}>
                        Welcome back
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--ink4)', fontWeight: 300 }}>Sign in to your account</p>
                </div>

                {registered && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px', background: 'var(--sage-bg)', border: '1px solid var(--sage-border)', borderRadius: 'var(--r)', marginBottom: '20px' }}>
                        <CheckCircle size={15} style={{ color: 'var(--sage)', flexShrink: 0, marginTop: '1px' }} />
                        <span style={{ fontSize: '13px', color: 'var(--sage)', lineHeight: 1.5 }}>
                            Account created. Please wait for admin approval before logging in.
                        </span>
                    </div>
                )}

                {error && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px', background: 'var(--rose-bg)', border: '1px solid var(--rose-border)', borderRadius: 'var(--r)', marginBottom: '20px' }}>
                        <AlertCircle size={15} style={{ color: 'var(--rose)', flexShrink: 0, marginTop: '1px' }} />
                        <span style={{ fontSize: '13px', color: 'var(--rose)', lineHeight: 1.5 }}>{error}</span>
                    </div>
                )}

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontFamily: 'var(--ff-ui)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--ink3)', textTransform: 'uppercase' }}>
                            Username
                        </label>
                        <input name="username" required autoComplete="username" className="input" placeholder="your_handle" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontFamily: 'var(--ff-ui)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--ink3)', textTransform: 'uppercase' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input name="password" type={showPw ? 'text' : 'password'} required autoComplete="current-password" className="input" placeholder="" style={{ paddingRight: '40px' }} />
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-ink"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '6px', display: 'flex', gap: '8px', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? (
                            <>
                                <span className="spin" style={{ width: '14px', height: '14px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                                Signing in
                            </>
                        ) : (
                            <>
                                <LogIn size={15} />
                                Sign in
                            </>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--ink4)' }}>
                    No account yet?{' '}
                    <Link href="/register" style={{ color: 'var(--sage)', fontWeight: 500, textDecoration: 'none' }}>
                        Sign up free
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '80vh' }} />}>
            <LoginForm />
        </Suspense>
    );
}
