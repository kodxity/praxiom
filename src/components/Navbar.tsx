<<<<<<< HEAD
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
=======
﻿'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { LogOut, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

function useUnreadCount(hasGroup: boolean) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!hasGroup) return;
        const poll = () => fetch('/api/user/unread-messages').then(r => r.json()).then(d => setCount(d.count ?? 0)).catch(() => {});
        poll();
        const id = setInterval(poll, 15000);
        return () => clearInterval(id);
    }, [hasGroup]);
    return count;
}

export function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const groupId = session?.user?.groupId ?? null;
    const unread = useUnreadCount(!!groupId);
    const showChatIcon = !!groupId;

    const links = [
        { name: 'Home', href: '/' },
        { name: 'Contests', href: '/contests' },
        { name: 'Problems', href: '/problems' },
        { name: 'Leaderboard', href: '/leaderboard' },
        { name: 'Blog', href: '/blog' },
        { name: 'Resources', href: '/resources' },
    ];

    if (session?.user?.isAdmin) {
        links.push({ name: 'Admin', href: '/admin' });
    }
    if (session?.user?.isTeacher) {
        links.push({ name: 'My Group', href: '/teacher' });
    } else if (session?.user?.groupId) {
        links.push({ name: 'My Group', href: `/groups/${session.user.groupId}` });
    }

    const navBg = {
        background: 'var(--theme-nav-bg, rgba(238,234,227,0.88))',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderBottom: '1px solid var(--theme-nav-border, rgba(0,0,0,0.06))',
        transition: 'background 0.4s ease, border-color 0.4s ease',
    };
    const textColor = 'var(--theme-nav-text, var(--ink))';
    const mutedColor = 'var(--theme-nav-muted, var(--ink4))';

    function isActive(href: string) {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    }

    function activeLinkStyle(href: string) {
        return isActive(href)
            ? { background: 'var(--theme-nav-active-bg, white)', color: 'var(--theme-nav-text, var(--ink))', borderRadius: '9px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
            : { color: 'var(--theme-nav-muted, var(--ink4))', borderRadius: '9px' };
    }

    return (
        <nav className="sticky top-0 z-50" style={{ ...navBg, color: textColor }}>
            <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 1.75rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>

                {/* Logo */}
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '0' }}>
                    <span style={{ fontFamily: 'var(--ff-display, Instrument Serif, serif)', fontSize: '20px', fontStyle: 'italic', color: 'var(--theme-logo-accent, var(--sage))', lineHeight: 1, marginRight: '3px' }}>Σ</span>
                    <span style={{ fontFamily: 'var(--ff-display, Instrument Serif, serif)', fontSize: '22px', fontWeight: 400, color: 'var(--theme-logo-text, var(--ink))', lineHeight: 1 }}>Praxi</span>
                    <em style={{ fontFamily: 'var(--ff-display, Instrument Serif, serif)', fontSize: '22px', fontStyle: 'italic', color: 'var(--theme-logo-accent, var(--sage))', lineHeight: 1 }}>s</em>
                </Link>

                {/* Desktop links - absolutely centered so they don't shift with asymmetric logo/user widths */}
                <ul className="nav-desktop" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', gap: '2px', listStyle: 'none', alignItems: 'center', margin: 0, padding: 0 }}>
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                style={{
                                    fontFamily: 'var(--ff-ui, Instrument Sans, sans-serif)',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    textDecoration: 'none',
                                    padding: '7px 14px',
                                    display: 'block',
                                    transition: 'all 0.15s',
                                    ...activeLinkStyle(link.href),
                                }}
                            >
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Desktop user area */}
                <div className="nav-desktop" style={{ alignItems: 'center', gap: '12px' }}>
                    {session ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(0,0,0,0.04)', borderRadius: '8px' }}>
                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: textColor }}>
                                    {session.user.username}
                                </span>
                            </div>
                            {showChatIcon && (
                                <Link
                                    href={`/groups/${groupId}/chat`}
                                    aria-label="Group chat"
                                    style={{ position: 'relative', width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pathname.startsWith(`/groups/${groupId}/chat`) ? 'var(--sage)' : mutedColor, background: pathname.startsWith(`/groups/${groupId}/chat`) ? 'rgba(107,148,120,0.1)' : 'transparent', transition: 'all 0.15s', textDecoration: 'none' }}
                                >
                                    <MessageCircle size={18} />
                                    {unread > 0 && (
                                        <span style={{ position: 'absolute', top: '2px', right: '2px', minWidth: '16px', height: '16px', borderRadius: '99px', background: 'var(--rose, #c03030)', color: 'white', fontFamily: 'var(--ff-mono)', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', lineHeight: 1 }}>
                                            {unread > 99 ? '99+' : unread}
                                        </span>
                                    )}
                                </Link>
                            )}
                            <Link
                                href={`/user/${session.user.username}`}
                                style={{
                                    width: '34px', height: '34px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--sage-bg), var(--slate-bg))',
                                    border: '2px solid rgba(255,255,255,0.7)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 600,
                                    color: 'var(--ink2)',
                                    textDecoration: 'none',
                                }}
                            >
                                {(session.user.username?.[0] ?? 'U').toUpperCase()}
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                style={{ padding: '7px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: mutedColor, transition: 'all 0.15s', display: 'flex', alignItems: 'center' }}
                                aria-label="Sign out"
                            >
                                <LogOut size={15} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" style={{ fontFamily: 'var(--ff-ui)', fontSize: '14px', fontWeight: 500, color: mutedColor, textDecoration: 'none', padding: '7px 14px', borderRadius: '9px', transition: 'color 0.15s' }}>
                                Log in
                            </Link>
                            <Link href="/register" style={{ fontFamily: 'var(--ff-ui)', fontSize: '14px', fontWeight: 500, padding: '8px 18px', borderRadius: 'var(--r)', background: 'var(--sage)', color: 'white', textDecoration: 'none', transition: 'opacity 0.15s' }}>
                                Sign up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile hamburger  hidden on desktop via .nav-mobile CSS class */}
                <button
                    className={`nav-mobile hamburger${isOpen ? ' open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ background: 'transparent', border: 'none', color: textColor, padding: '6px', borderRadius: '8px' }}
                    aria-label="Toggle menu"
                    aria-expanded={isOpen}
                >
                    <span className="hamburger-bar" />
                    <span className="hamburger-bar" />
                    <span className="hamburger-bar" />
                </button>
            </div>

            {/* Mobile menu  slide down, only rendered when open */}
            {isOpen && (
                <div
                    className="mobile-menu nav-mobile"
                    style={{
                        flexDirection: 'column',
                        borderTop: '1px solid var(--theme-nav-border, rgba(0,0,0,0.06))',
                        padding: '12px 1.75rem 20px',
                        background: 'var(--theme-nav-mobile-bg, rgba(238,234,227,0.97))',
                        transition: 'background 0.4s ease',
                    }}
                >
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {links.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    style={{ display: 'block', padding: '9px 14px', fontFamily: 'var(--ff-ui)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', borderRadius: '9px', ...activeLinkStyle(link.href) }}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: '12px', paddingTop: '12px' }}>
                        {session ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <Link href={`/user/${session.user.username}`} onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '9px 14px', fontFamily: 'var(--ff-ui)', fontSize: '14px', textDecoration: 'none', color: textColor, borderRadius: '9px' }}>
                                    Profile ({session.user.username})
                                </Link>
                                {showChatIcon && (
                                    <Link href={`/groups/${groupId}/chat`} onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', fontFamily: 'var(--ff-ui)', fontSize: '14px', textDecoration: 'none', color: textColor, borderRadius: '9px' }}>
                                        <MessageCircle size={15} />
                                        Group Chat
                                        {unread > 0 && (
                                            <span style={{ minWidth: '18px', height: '18px', borderRadius: '99px', background: 'var(--rose, #c03030)', color: 'white', fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                                                {unread > 99 ? '99+' : unread}
                                            </span>
                                        )}
                                    </Link>
                                )}
                                <button onClick={() => signOut({ callbackUrl: '/' })} style={{ display: 'block', padding: '9px 14px', fontFamily: 'var(--ff-ui)', fontSize: '14px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: mutedColor, borderRadius: '9px', width: '100%' }}>
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <Link href="/login" onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '10px', textAlign: 'center', fontFamily: 'var(--ff-ui)', fontSize: '14px', textDecoration: 'none', color: textColor, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 'var(--r)' }}>Log in</Link>
                                <Link href="/register" onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '10px', textAlign: 'center', fontFamily: 'var(--ff-ui)', fontSize: '14px', textDecoration: 'none', background: 'var(--sage)', color: 'white', borderRadius: 'var(--r)' }}>Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
>>>>>>> LATESTTHISONE-NEWMODES
