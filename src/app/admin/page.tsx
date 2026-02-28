import { prisma } from '@/lib/db';
import Link from 'next/link';
import { UserApproval } from './UserApproval';
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
            where: { isApproved: false },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.contest.findMany({
            orderBy: { startTime: 'desc' },
            select: { id: true, title: true, status: true, themeSlug: true, startTime: true },
        }),
    ]);

    const now = new Date();

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            {/* Page header */}
            <div style={{ marginBottom: '40px' }}>
                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Admin &middot; Dashboard
                </p>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '36px', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                    Control Panel
                </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

                {/* Quick Actions */}
                <div className="g" style={{ padding: '28px 32px' }}>
                    <p className="sec-label" style={{ marginBottom: '20px' }}>Quick Actions</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Link href="/admin/posts/new" className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: '10px' }}>
                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '14px', color: 'var(--sage)' }}>+</span>
                            New Announcement
                        </Link>
                        <Link href="/admin/contests/new" className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: '10px' }}>
                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '14px', color: 'var(--sage)' }}>+</span>
                            New Contest
                        </Link>
                        <Link href="/admin/themes/new" className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: '10px' }}>
                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '14px', color: 'var(--sage)' }}>+</span>
                            New Theme
                        </Link>
                    </div>
                    <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '10px' }}>Navigate</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {[
                                { href: '/contests',       label: 'Contests'    },
                                { href: '/problems',       label: 'Problems'    },
                                { href: '/leaderboard',    label: 'Leaderboard' },
                                { href: '/admin/themes',   label: 'Themes'      },
                            ].map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="admin-nav-link"
                                >
                                    {label}
                                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink5)' }}>→</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pending Users */}
                <div className="g" style={{ padding: '28px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <p className="sec-label" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Pending Approvals</p>
                        {pendingUsers.length > 0 && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                minWidth: '20px', height: '20px', borderRadius: '99px',
                                background: 'rgba(220,60,60,0.12)', color: 'rgba(200,50,50,0.9)',
                                fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 700, padding: '0 5px'
                            }}>
                                {pendingUsers.length}
                            </span>
                        )}
                    </div>
                    {pendingUsers.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '32px 20px', color: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: '12px', textAlign: 'center' }}>
                            <span style={{ fontSize: '20px', opacity: 0.4 }}>✓</span>
                            All caught up - no pending users.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                            {pendingUsers.map((user: any) => (
                                <UserApproval key={user.id} user={user} />
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Manage Contests */}
            <div className="g" style={{ padding: '28px 32px', marginTop: '24px' }}>
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
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ textAlign: 'left', padding: '8px 12px', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--ink5)', fontWeight: 400, textTransform: 'uppercase' }}>Title</th>
                                    <th style={{ textAlign: 'left', padding: '8px 12px', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--ink5)', fontWeight: 400, textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ textAlign: 'left', padding: '8px 12px', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--ink5)', fontWeight: 400, textTransform: 'uppercase' }}>Theme</th>
                                    <th style={{ textAlign: 'left', padding: '8px 12px', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--ink5)', fontWeight: 400, textTransform: 'uppercase' }}>Start</th>
                                    <th style={{ padding: '8px 12px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {contests.map((c: any) => {
                                    const start = new Date(c.startTime);
                                    const statusLabel = c.status === 'ACTIVE' ? '● Live' : c.status === 'SCHEDULED' ? 'Upcoming' : 'Ended';
                                    const statusColor = c.status === 'ACTIVE' ? 'rgba(80,170,100,0.9)' : c.status === 'SCHEDULED' ? 'rgba(100,140,200,0.9)' : 'var(--ink5)';
                                    const statusBg = c.status === 'ACTIVE' ? 'rgba(80,170,100,0.1)' : c.status === 'SCHEDULED' ? 'rgba(100,140,200,0.1)' : 'rgba(0,0,0,0.04)';
                                    return (
                                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '12px 12px', color: 'var(--ink)', fontWeight: 500 }}>{c.title}</td>
                                            <td style={{ padding: '12px 12px' }}>
                                                <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '99px', background: statusBg, color: statusColor, fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.06em' }}>
                                                    {statusLabel}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 12px', color: 'var(--ink4)', fontFamily: 'var(--ff-mono)', fontSize: '11px' }}>{c.themeSlug || '-'}</td>
                                            <td style={{ padding: '12px 12px', color: 'var(--ink4)', fontFamily: 'var(--ff-mono)', fontSize: '11px' }}>
                                                {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <Link href={`/contests/${c.id}`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink4)', textDecoration: 'none' }}>View</Link>
                                                    <Link href={`/admin/contests/${c.id}/edit`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--sage)', textDecoration: 'none' }}>Edit</Link>
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

