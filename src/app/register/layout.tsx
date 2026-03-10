import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Account',
    description:
        'Create a free Praxis account to join math contests, climb the leaderboard, and sharpen your competition math skills.',
    openGraph: {
        title: 'Create Account | Praxis',
        description: 'Join Praxis and start competing in math contests for free.',
        url: '/register',
    },
    alternates: { canonical: '/register' },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return children;
}
