import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In',
    description:
        'Sign in to your Praxis account to compete in math contests, track your rating, and solve problems.',
    openGraph: {
        title: 'Sign In | Praxis',
        description: 'Sign in to your Praxis account.',
        url: '/login',
    },
    alternates: { canonical: '/login' },
    robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children;
}
