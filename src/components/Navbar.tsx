'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { name: 'Home', href: '/' },
        { name: 'Contests', href: '/contests' },
        { name: 'Leaderboard', href: '/leaderboard' },
    ];

    if (session?.user?.isAdmin) {
        links.push({ name: 'Admin', href: '/admin' });
    }

    return (
        <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="font-bold text-xl tracking-tight">
                    MathShowUp
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === link.href ? "text-foreground" : "text-muted-foreground"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/user/${session.user.username}`}
                                className="flex items-center gap-2 text-sm font-medium hover:text-primary"
                            >
                                <UserIcon className="w-4 h-4" />
                                {session.user.username}
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                aria-label="Sign out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium hover:text-primary text-muted-foreground hover:text-foreground">
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t p-4 space-y-4 bg-background">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="block text-sm font-medium hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="pt-4 border-t">
                        {session ? (
                            <>
                                <Link
                                    href={`/user/${session.user.username}`}
                                    className="block py-2 text-sm font-medium hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Profile ({session.user.username})
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="block py-2 text-sm font-medium hover:text-primary w-full text-left"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/login"
                                    className="block py-2 text-center text-sm font-medium border rounded-md"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="block py-2 text-center text-sm font-medium bg-primary text-primary-foreground rounded-md"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
