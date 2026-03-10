import { prisma } from '@/lib/db';
import Link from 'next/link';
import { PendingApprovals } from './PendingApprovals';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        redirect('/');
    }

    const [pendingUsers, contests] = await Promise.all([
        prisma.user.findMany({
            where: {
                isApproved: false,
                OR: [
                    { isTeacher: true },
                    { groupId: null },
                ],
            },
            orderBy: { createdAt: 'desc' },
            include: {
                school: { select: { shortName: true, district: true } },
                taughtGroup: { select: { name: true } },
            },
        }),
        prisma.contest.findMany({
            orderBy: { startTime: 'desc' },
            select: { id: true, title: true, status: true, themeSlug: true, startTime: true },
        }),
    ]);

    const liveCount = contests.filter((c: any) => c.status === 'ACTIVE').length;
    const upcomingCount = contests.filter((c: any) => c.status === 'SCHEDULED').length;

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            {/* ── Page header ── */}
            <div style={{ marginBottom: '28px' }}>
                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Admin &middot; Dashboard
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <h1 style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '36px', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0 }}>
                        Control Panel
                    </h1>
                    {/* At-a-glance stats */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingBottom: '4px' }}>
                        {pendingUsers.length > 0 && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '4px 12px', borderRadius: '99px',
                                background: 'rgba(220,60,60,0.08)', border: '1px solid rgba(220,60,60,0.18)',
                                fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(200,50,50,0.9)',
                            }}>
                                <span style={{ fontWeight: 700 }}>{pendingUsers.length}</span> pending
                            </span>
                        )}
                        {liveCount > 0 && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '4px 12px', borderRadius: '99px',
                                background: 'rgba(80,170,100,0.08)', border: '1px solid rgba(80,170,100,0.2)',
                                fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(60,150,80,0.9)',
                            }}>
                                ● <span style={{ fontWeight: 700 }}>{liveCount}</span> live
                            </span>
                        )}
                        {upcomingCount > 0 && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '4px 12px', borderRadius: '99px',
                                background: 'rgba(100,140,200,0.08)', border: '1px solid rgba(100,140,200,0.2)',
                                fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(80,120,180,0.9)',
                            }}>
                                <span style={{ fontWeight: 700 }}>{upcomingCount}</span> upcoming
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Quick Actions bar ── */}
            <div style={{
                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px',
                padding: '14px 20px', marginBottom: '28px',
                background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--r)',
                border: '1px solid var(--border)',
            }}>
                {/* Create actions */}
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--ink5)', textTransform: 'uppercase', marginRight: '4px' }}>Create</span>
                {[
                    { href: '/admin/posts/new',    label: 'Announcement' },
                    { href: '/admin/contests/new', label: 'Contest'      },
                    { href: '/admin/themes/new',   label: 'Theme'        },
                ].map(({ href, label }) => (
                    <Link key={href} href={href} className="btn btn-ghost btn-sm" style={{ gap: '6px' }}>
                        <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--sage)', fontSize: '13px', lineHeight: 1 }}>+</span>
                        {label}
                    </Link>
                ))}

                {/* Divider */}
                <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 10px', flexShrink: 0 }} />

                {/* Navigation links */}
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--ink5)', textTransform: 'uppercase', marginRight: '4px' }}>Go to</span>
                {[
                    { href: '/contests',     label: 'Contests'    },
                    { href: '/problems',     label: 'Problems'    },
                    { href: '/leaderboard',  label: 'Leaderboard' },
                    { href: '/admin/themes', label: 'Themes'      },
                ].map(({ href, label }) => (
                    <Link key={href} href={href} className="admin-nav-link" style={{ justifyContent: 'initial', gap: '5px', fontFamily: 'var(--ff-mono)', fontSize: '12px' }}>
                        {label} <span style={{ opacity: 0.4 }}>↗</span>
                    </Link>
                ))}
            </div>

            {/* ── Pending Approvals ── */}
            <div className="g" style={{ padding: '28px 32px', marginBottom: '24px' }}>
                <PendingApprovals users={pendingUsers} />
            </div>

            {/* ── Manage Contests ── */}
            <div className="g" style={{ padding: '28px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <p className="sec-label" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Manage Contests</p>
                    <Link href="/admin/contests/new" style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--sage)', textDecoration: 'none', letterSpacing: '0.06em' }}>+ New</Link>
                </div>

                {contests.length === 0 ? (
                    <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: '12px' }}>
                        No contests yet.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--ff-ui)', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    {['Title', 'Status', 'Theme', 'Start'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--ink5)', fontWeight: 400, textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                    <th style={{ padding: '8px 14px' }} />
                                </tr>
                            </thead>
                            <tbody>
                                {contests.map((c: any) => {
                                    const start = new Date(c.startTime);
                                    const statusLabel = c.status === 'ACTIVE' ? '● Live' : c.status === 'SCHEDULED' ? 'Upcoming' : 'Ended';
                                    const statusColor = c.status === 'ACTIVE' ? 'rgba(60,150,80,0.95)' : c.status === 'SCHEDULED' ? 'rgba(80,120,180,0.9)' : 'var(--ink5)';
                                    const statusBg = c.status === 'ACTIVE' ? 'rgba(80,170,100,0.1)' : c.status === 'SCHEDULED' ? 'rgba(100,140,200,0.1)' : 'rgba(0,0,0,0.04)';
                                    return (
                                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '13px 14px', color: 'var(--ink)', fontWeight: 500 }}>{c.title}</td>
                                            <td style={{ padding: '13px 14px' }}>
                                                <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '99px', background: statusBg, color: statusColor, fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.06em', fontWeight: 600 }}>
                                                    {statusLabel}
                                                </span>
                                            </td>
                                            <td style={{ padding: '13px 14px', color: 'var(--ink4)', fontFamily: 'var(--ff-mono)', fontSize: '11px' }}>{c.themeSlug || <span style={{ opacity: 0.35 }}>-</span>}</td>
                                            <td style={{ padding: '13px 14px', color: 'var(--ink4)', fontFamily: 'var(--ff-mono)', fontSize: '11px' }}>
                                                {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                    <Link href={`/contests/${c.id}`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink4)', textDecoration: 'none' }}>View</Link>
                                                    <Link href={`/admin/contests/${c.id}/edit`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--sage)', textDecoration: 'none', fontWeight: 600 }}>Edit</Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
}

