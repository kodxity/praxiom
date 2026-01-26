'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState('');
    const registered = searchParams.get('registered');

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        const res = await signIn('credentials', {
            username,
            password,
            redirect: false
        });

        if (res?.error) {
            setError(res.error);
        } else {
            router.push('/');
            router.refresh();
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-sm bg-card">
            <h1 className="text-2xl font-bold mb-6 text-center">Log In</h1>
            {registered && (
                <div className="p-3 mb-4 text-sm text-green-600 bg-green-50 rounded">
                    Account created! Please wait for admin approval before logging in.
                </div>
            )}
            {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded">{error}</div>}
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input name="username" required className="input" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input name="password" type="password" required className="input" />
                </div>
                <button type="submit" className="w-full btn btn-primary">Log In</button>
            </form>
            <div className="mt-4 text-center text-sm">
                Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline">Sign up</Link>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
