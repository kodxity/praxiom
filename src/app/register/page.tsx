'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        const res = await fetch('/api/register', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
            router.push('/login?registered=true');
        } else {
            const json = await res.json();
            setError(json.message || 'Registration failed. Try a different username.');
            setLoading(false);
        }
    }

    return (
        <div style={{ position: 'relative', zIndex: 1, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.75rem' }}>
            <div className="g scale-in" style={{ width: '100%', maxWidth: '420px', padding: '40px 40px' }}>

                {/* Wordmark */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'baseline', gap: '0' }}>
                        <span style={{ fontFamily: 'var(--ff-display)', fontSize: '20px', fontStyle: 'italic', color: 'var(--sage)', marginRight: '3px' }}>Σ</span>
                        <span style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', fontWeight: 400, color: 'var(--ink)' }}>Praxi</span>
                        <em style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', fontStyle: 'italic', color: 'var(--sage)' }}>s</em>
                    </Link>
                    <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '28px', fontWeight: 400, color: 'var(--ink)', marginTop: '20px', marginBottom: '6px', lineHeight: 1.1 }}>
                        Join Praxis
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--ink4)', fontWeight: 300 }}>Create your solver account</p>
                </div>

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
                        <input name="username" required autoComplete="username" className="input" placeholder="choose a handle" />
                        <span style={{ fontSize: '11px', color: 'var(--ink5)', fontFamily: 'var(--ff-mono)' }}>This will be your public display name</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontFamily: 'var(--ff-ui)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--ink3)', textTransform: 'uppercase' }}>
                            Password
                        </label>
                        <input name="password" type="password" required autoComplete="new-password" className="input" placeholder="min. 6 characters" minLength={6} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontFamily: 'var(--ff-ui)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--ink3)', textTransform: 'uppercase' }}>
                            Bio <span style={{ fontWeight: 400, color: 'var(--ink5)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                        </label>
                        <textarea name="description" className="input" rows={2} placeholder="Tell us about yourself" style={{ resize: 'vertical' }} />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-sage"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '6px', display: 'flex', gap: '8px', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? (
                            <>
                                <span className="spin" style={{ width: '14px', height: '14px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                                Creating account
                            </>
                        ) : (
                            <>
                                <UserPlus size={15} />
                                Create account
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '20px', padding: '12px 14px', background: 'rgba(0,0,0,0.03)', borderRadius: 'var(--r)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <p style={{ fontSize: '12px', color: 'var(--ink5)', lineHeight: 1.55, fontFamily: 'var(--ff-mono)', textAlign: 'center' }}>
                        Accounts are manually approved. You will be able to log in once an admin approves your request.
                    </p>
                </div>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--ink4)' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'var(--sage)', fontWeight: 500, textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </p>

            </div>
        </div>
    );
}
