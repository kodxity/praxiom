'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState('');

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        // Simple client-side validation could go here

        const res = await fetch('/api/register', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            // Redirect to login with proper query parameter
            router.push('/login?registered=true');
        } else {
            const json = await res.json();
            setError(json.message || 'Registration failed');
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-sm bg-card">
            <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
            {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded">{error}</div>}
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input name="username" required className="input" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input name="password" type="password" required className="input" minLength={6} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Description (bio)</label>
                    <textarea name="description" className="input" rows={3} placeholder="Tell us about yourself (optional)" />
                </div>
                <button type="submit" className="w-full btn btn-primary">Sign Up</button>
            </form>
            <div className="mt-4 text-center text-sm">
                Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
            </div>
        </div>
    )
}
