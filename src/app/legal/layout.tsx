import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Legal',
    description:
        'Privacy Policy, Terms of Service, Cookie Notice, and GDPR information for Praxis.',
    openGraph: {
        title: 'Legal | Praxis',
        description: 'Privacy Policy, Terms of Service, and Cookie Notice for Praxis.',
        url: '/legal',
    },
    alternates: { canonical: '/legal' },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return children;
}
