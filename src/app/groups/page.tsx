import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { JoinGroupButton } from './JoinGroupButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Groups',
    description: 'Browse all Praxiom groups and request to join.',
    openGraph: { title: 'Groups | Praxiom', description: 'Browse all Praxiom groups and request to join.', url: '/groups' },
    alternates: { canonical: '/groups' },
};

export const dynamic = 'force-dynamic';

export default async function GroupsPage() {
    const session = await getServerSession(authOptions);

    let groups: any[] = [];
    let pendingSet = new Set<string>();

    try {
        groups = await prisma.orgGroup.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                school: { select: { shortName: true, district: true } },
                teacher: { select: { username: true } },
                _count: { select: { members: true } },
            },
        });

        if (session?.user?.id) {
            const pending = await prisma.groupJoinRequest.findMany({
                where: { userId: session.user.id, status: 'PENDING' },
                select: { groupId: true },
            });
            pendingSet = new Set(pending.map(p => p.groupId));
        }
    } catch { /* DB unavailable */ }

    return (
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '48px 1.75rem 80px', position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: '28px' }}>
                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Community · Groups
                </p>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                    Praxiom Groups
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--ink4)' }}>
                    Browse any group and request to join. Teachers review requests.
                </p>
            </div>

            {groups.length === 0 ? (
                <div className="g" style={{ padding: '28px', textAlign: 'center', color: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: '12px' }}>
                    No groups yet.
                </div>
            ) : (
                <div className="g" style={{ overflow: 'hidden' }}>
                    {groups.map((g, i) => {
                        const isTeacher = session?.user?.isTeacher && session.user.groupId === g.id;
                        const isMember = !isTeacher && session?.user?.groupId === g.id;
                        const status: 'member' | 'teacher' | 'pending' | 'none' | 'login' = !session
                            ? 'login'
                            : isTeacher
                                ? 'teacher'
                                : isMember
                                    ? 'member'
                                    : pendingSet.has(g.id)
                                        ? 'pending'
                                        : 'none';

                        return (
                            <div
                                key={g.id}
                                className="lb-row"
                                style={{
                                    animationDelay: `${0.02 + i * 0.02}s`,
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto',
                                    gap: '12px',
                                    alignItems: 'center',
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <Link href={`/groups/${g.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '15px', color: 'var(--ink)', marginBottom: '2px' }}>
                                            {g.name}
                                        </div>
                                    </Link>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                        {g.school ? (
                                            <>
                                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)' }}>{g.school.shortName}</span>
                                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink6, var(--ink5))' }}>{g.school.district}</span>
                                            </>
                                        ) : (
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)' }}>Independent group</span>
                                        )}
                                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink6, var(--ink5))' }}>
                                            · {g._count.members} member{g._count.members !== 1 ? 's' : ''}
                                        </span>
                                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink6, var(--ink5))' }}>
                                            · Teacher {g.teacher.username}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <JoinGroupButton groupId={g.id} status={status} compact />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
