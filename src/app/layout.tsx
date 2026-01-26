import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MathShowUp',
  description: 'A platform for math competitions and learning.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />
            <main className="flex-1 w-full container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} MathShowUp. All rights reserved.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
