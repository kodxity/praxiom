import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { JoinGroupButton } from './JoinGroupButton';
import { CreateGroupForm } from './CreateGroupForm';
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
                teacher: { select: { id: true, username: true } },
                _count: { select: { members: true } },
            },
        });
        console.log('[DEBUG] GroupsPage found total groups:', groups.length);

        if (session?.user?.id) {
            const pending = await prisma.groupJoinRequest.findMany({
                where: { userId: session.user.id, status: 'PENDING' },
                select: { groupId: true },
            });
            pendingSet = new Set(pending.map(p => p.groupId));
        }
    } catch (e) {
        console.error('Database Error in GroupsPage:', e);
    }

    // Always read teacher status and group membership fresh from DB — JWT can be stale
    let dbIsTeacher = false;
    let dbIsMemberOrTeacher = false;
    let dbGroupIds: string[] = [];
    if (session?.user?.id) {
        try {
            const dbUser = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: {
                    isTeacher: true,
                    taughtGroups: { select: { id: true } },
                    groupMemberships: { select: { groupId: true } },
                },
            });
            if (dbUser) {
                dbIsTeacher = dbUser.isTeacher;
                const taughtIds = dbUser.taughtGroups.map(g => g.id);
                const memberIds = dbUser.groupMemberships.map(m => m.groupId);
                dbGroupIds = [...taughtIds, ...memberIds];
                dbIsMemberOrTeacher = dbGroupIds.length > 0;
            }
        } catch { /* non-fatal */ }
    }

    // IDs of groups the student is actually a member of (empty for teachers)
    const userMemberIds = !dbIsTeacher ? dbGroupIds : [];

    const canCreateGroup = dbIsTeacher && !dbIsMemberOrTeacher;

    // Pin the user's own group(s) to the top of the list
    const sortedGroups = [...groups].sort((a, b) => {
        const aIsMine = (dbIsTeacher && a.teacher.id === session?.user?.id)
            || userMemberIds.includes(a.id);
        const bIsMine = (dbIsTeacher && b.teacher.id === session?.user?.id)
            || userMemberIds.includes(b.id);
        if (aIsMine && !bIsMine) return -1;
        if (!aIsMine && bIsMine) return 1;
        return 0;
    });

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

            {canCreateGroup && <CreateGroupForm />}

            {groups.length === 0 ? (
                <div className="g" style={{ padding: '28px', textAlign: 'center', color: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: '12px' }}>
                    No groups yet.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'var(--glass)', backdropFilter: 'blur(22px) saturate(1.5)', WebkitBackdropFilter: 'blur(22px) saturate(1.5)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow)', borderRadius: 'var(--r-lg)', overflow: 'visible' }}>
                    {sortedGroups.map((g, i) => {
                        const isTeacher = dbIsTeacher && g.teacher.id === session?.user?.id;
                        const isMember = !isTeacher && userMemberIds.includes(g.id);
                        const isMyGroup = isTeacher || isMember;
                        const isInOtherGroup = !isMember && !isTeacher && userMemberIds.length > 0;
                        const status: 'member' | 'teacher' | 'pending' | 'none' | 'login' | 'other_group' = !session
                            ? 'login'
                            : isTeacher
                                ? 'teacher'
                                : isMember
                                    ? 'member'
                                    : isInOtherGroup
                                        ? 'other_group'
                                        : pendingSet.has(g.id)
                                            ? 'pending'
                                            : 'none';

                        return (
                            <div key={g.id} style={{ position: 'relative' }}>
                            {isMyGroup && (
                                <div style={{ position: 'absolute', left: '-16px', top: '50%', transform: 'translateY(-50%)', height: 'calc(100% - 14px)', width: '3px', background: 'var(--sage)', borderRadius: '99px' }} />
                            )}
                            <div
                                className="lb-row"
                                style={{
                                    animationDelay: `${0.02 + i * 0.02}s`,
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto',
                                    gap: '12px',
                                    alignItems: 'center',
                                    borderRadius: i === 0 ? 'var(--r-lg) var(--r-lg) 0 0' : i === sortedGroups.length - 1 ? '0 0 var(--r-lg) var(--r-lg)' : undefined,
                                    ...(isMyGroup ? { background: 'var(--sage-tint, rgba(var(--sage-rgb,80,160,120),0.06))' } : {}),
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                        <Link href={`/groups/${g.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <span style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '15px', color: 'var(--ink)' }}>
                                                {g.name}
                                            </span>
                                        </Link>
                                        {isMyGroup && (
                                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sage)', background: 'transparent', border: '1px solid var(--sage)', borderRadius: '4px', padding: '1px 5px', lineHeight: '1.6' }}>
                                                Your group
                                            </span>
                                        )}
                                    </div>
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                    <JoinGroupButton groupId={g.id} status={status} compact />
                                    <Link
                                        href={`/groups/${g.id}`}
                                        className="btn btn-ghost btn-sm"
                                        style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                                    >
                                        Open →
                                    </Link>
                                </div>
                            </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
