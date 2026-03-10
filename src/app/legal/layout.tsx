import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Legal',
    description:
        'Privacy Policy, Terms of Service, Cookie Notice, and GDPR information for Praxiom.',
    openGraph: {
        title: 'Legal | Praxiom',
        description: 'Privacy Policy, Terms of Service, and Cookie Notice for Praxiom.',
        url: '/legal',
    },
    alternates: { canonical: '/legal' },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return children;
}
