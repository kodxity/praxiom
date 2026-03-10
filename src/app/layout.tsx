import type { Metadata } from 'next';
import {
  Instrument_Serif,
  DM_Sans,
  Instrument_Sans,
  JetBrains_Mono,
} from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { KaTeXLoader } from '@/components/KaTeXLoader';
import { LiveContestBanner } from '@/components/LiveContestBanner';
// import { CustomCursor } from '@/components/CustomCursor'; // disabled

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-ui',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const BASE_URL = (process.env.NEXTAUTH_URL ?? 'https://praxiom.vercel.app').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Praxiom — Math Contest Platform',
    template: '%s | Praxiom',
  },
  description:
    'Praxiom is a competitive math platform where students solve contest problems, climb the leaderboard, and sharpen their skills for AMC, AIME, and olympiad competitions.',
  keywords: [
    'math contest',
    'competition math',
    'AMC',
    'AIME',
    'math olympiad',
    'math problems',
    'math leaderboard',
    'math competition platform',
    'math practice',
  ],
  authors: [{ name: 'Praxiom' }],
  creator: 'Praxiom',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Praxiom',
    title: 'Praxiom — Math Contest Platform',
    description:
      'Compete, solve, and climb. The premier math contest platform for AMC, AIME, and olympiad prep.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Praxiom — Math Contest Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Praxiom — Math Contest Platform',
    description: 'Compete, solve, and climb. The premier math contest platform.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontVars = [
    instrumentSerif.variable,
    dmSans.variable,
    instrumentSans.variable,
    jetbrainsMono.variable,
  ].join(' ');

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': `${BASE_URL}/#website`,
                  url: BASE_URL,
                  name: 'Praxiom',
                  description: 'A competitive math contest platform for AMC, AIME, and olympiad preparation.',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/problems?q={search_term_string}` },
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'Organization',
                  '@id': `${BASE_URL}/#organization`,
                  name: 'Praxiom',
                  url: BASE_URL,
                  logo: { '@type': 'ImageObject', url: `${BASE_URL}/icon.svg` },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={fontVars} style={{ fontFamily: 'var(--font-body, DM Sans, sans-serif)' }}>
        <Providers>
          {/* Ambient blobs - fixed bg layer */}
          <div className="blobs" aria-hidden="true">
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />
          </div>
          <KaTeXLoader />
          <div className="min-h-screen flex flex-col" style={{ position: 'relative', zIndex: 1 }}>
            <Navbar />
            <LiveContestBanner />
            <main className="flex-1 w-full">
              {children}
            </main>
            <footer
              style={{ background: 'var(--theme-footer-bg, transparent)', borderTop: '1px solid var(--theme-footer-border, rgba(0,0,0,0.07))', color: 'var(--theme-footer-text, rgba(60,55,45,0.68))', padding: '24px', textAlign: 'center', fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.04em', transition: 'color 0.4s ease, border-color 0.4s ease, background 0.4s ease' }}
            >
              <div style={{ marginBottom: '8px' }}>
                © {new Date().getFullYear()} Praxiom. All rights reserved.
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <a href="/legal" style={{ color: 'var(--theme-footer-text, rgba(60,55,45,0.68))', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="/legal" style={{ color: 'var(--theme-footer-text, rgba(60,55,45,0.68))', textDecoration: 'none' }}>Terms of Service</a>
                <a href="/legal" style={{ color: 'var(--theme-footer-text, rgba(60,55,45,0.68))', textDecoration: 'none' }}>Cookie Notice</a>
                <a href="/legal" style={{ color: 'var(--theme-footer-text, rgba(60,55,45,0.68))', textDecoration: 'none' }}>GDPR</a>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
