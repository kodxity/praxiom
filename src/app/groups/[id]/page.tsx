import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GroupBioEditor } from './GroupBioEditor';
import Link from 'next/link';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { JoinGroupButton } from '../JoinGroupButton';
import { TeacherDashboardClient } from '@/app/teacher/TeacherDashboardClient';

export const dynamic = 'force-dynamic';

function getRankLabel(rating: number) {
    if (rating >= 2400) return { label: 'Archon',   cls: 'rank-archon' };
    if (rating >= 2000) return { label: 'Legend',   cls: 'rank-legend' };
    if (rating >= 1600) return { label: 'Seeker',   cls: 'rank-seeker' };
    return                     { label: 'Initiate', cls: 'rank-initiate' };
}

function getRatingColor(rating: number) {
    if (rating >= 2400) return 'var(--amber)';
    if (rating >= 2000) return 'var(--violet)';
    if (rating >= 1600) return 'var(--slate)';
    if (rating >= 1400) return 'var(--sage)';
    return 'var(--ink3)';
}

export default async function GroupPage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const session = await getServerSession(authOptions);

    let group: any = null;
    try {
        console.log('Fetching group with ID:', id);
        group = await prisma.orgGroup.findUnique({
            where: { id },
            include: {
                school: true,
                teacher: { select: { id: true, username: true, rating: true } },
                members: {
                    orderBy: { user: { rating: 'desc' } },
                    select: { user: { id: true, username: true, rating: true, isApproved: true } },
                },
                joinRequests: {
                    where: { userId: session?.user?.id ?? 'none' }
                }
            },
        });
        console.log('Group found:', group?.id ?? 'NULL');
    } catch (e) { 
        console.error('Prisma Error in GroupPage:', e);
    }

    if (!group) {
        const allGroups = await prisma.orgGroup.findMany({ select: { id: true, name: true } });
        console.log('Group not found. Requested ID (quoted):', JSON.stringify(id));
        console.log('CUID sample from DB:', allGroups.length > 0 ? JSON.stringify(allGroups[0].id) : 'NONE');
        console.log('Total groups in DB:', allGroups.length);
        notFound();
    }

    const isTeacherOfGroup = session?.user?.id === group.teacherId;
    const approvedMembers = group.members.filter((m: any) => m.user.isApproved);
    const isMember = group.members.some((m: any) => m.user.id === session?.user?.id);
    const canChat = isTeacherOfGroup || isMember;
    let hasPendingRequest = false;
    if (session?.user?.id && !isTeacherOfGroup && !isMember) {
        hasPendingRequest = group.joinRequests.some((r: any) => r.status === 'PENDING');
    }
    const topMember = approvedMembers[0]?.user ?? null;

    return (
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 1.75rem 80px', position: 'relative', zIndex: 1 }}>

            {/* Breadcrumb / back */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--sage)', textTransform: 'uppercase', margin: 0 }}>
                    <Link href="/groups" style={{ color: 'inherit', textDecoration: 'none' }}>Groups</Link>
                    {' '}&rsaquo;{' '}
                    {group.name}
                </p>
                <Link href="/groups" className="btn btn-ghost btn-sm" style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px' }}>
                    Back to groups
                </Link>
            </div>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                            {group.name}
                        </h1>
                        {group.school ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink4)' }}>
                                    {group.school.name}
                                </span>
                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', padding: '1px 8px', borderRadius: '99px', background: 'rgba(0,0,0,0.05)' }}>
                                    {group.school.district}
                                </span>
                            </div>
                        ) : (
                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink5)' }}>Independent group</span>
                        )}
                    </div>

                    {/* Stats pills */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <div style={{ padding: '8px 16px', borderRadius: 'var(--r)', background: 'rgba(107,148,120,0.08)', border: '1px solid rgba(107,148,120,0.18)' }}>
                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--sage)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>Members</div>
                            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', fontWeight: 400, color: 'var(--ink)' }}>{group.members.length}</div>
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <JoinGroupButton
                        groupId={group.id}
                        status={
                            !session ? 'login'
                                : isTeacherOfGroup ? 'teacher'
                                    : isMember ? 'member'
                                        : hasPendingRequest ? 'pending'
                                            : 'none'
                        }
                    />
                </div>
            </div>

            {/* Teacher info */}
            <div className="g" style={{ padding: '18px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(88,120,160,0.1)', border: '1px solid rgba(88,120,160,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--slate, #5878a0)', flexShrink: 0 }}>
                    {group.teacher.username[0].toUpperCase()}
                </div>
                <div>
                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>Teacher</div>
                    <Link href={`/user/${group.teacher.username}`} style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--ink)', textDecoration: 'none' }}>
                        {group.teacher.username}
                    </Link>
                </div>
            </div>

            {/* Bio */}
            <div className="g" style={{ padding: '22px 26px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <p className="sec-label" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>About this group</p>
                </div>
                <GroupBioEditor
                    groupId={group.id}
                    initialBio={group.bio}
                    isTeacher={isTeacherOfGroup}
                />
            </div>

            {/* Members leaderboard */}
            {canChat && (
                <Link
                    href={`/groups/${id}/chat`}
                    className="g"
                    style={{
                        padding: '16px 24px', marginBottom: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        textDecoration: 'none', color: 'inherit', cursor: 'pointer',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(107,148,120,0.1)', border: '1px solid rgba(107,148,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <MessageCircle size={16} style={{ color: 'var(--sage)' }} />
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--ink)', marginBottom: '2px' }}>Group Chat</div>
                            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)' }}>Chat with your group</div>
                        </div>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--ink5)' }} />
                </Link>
            )}

            {/* Members List */}
            <div className="g" style={{ padding: '22px 0', overflow: 'hidden' }}>
                <p className="sec-label" style={{ marginBottom: '4px', paddingLeft: '26px', paddingRight: '26px' }}>
                    Members &middot; {approvedMembers.length}
                </p>

                {approvedMembers.length === 0 ? (
                    <div style={{ padding: '32px 26px', textAlign: 'center', color: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: '12px' }}>
                        No approved members yet.
                    </div>
                ) : (
                    approvedMembers.map((memberWrap: any, i: number) => {
                        const member = memberWrap.user;
                        const rank = getRankLabel(member.rating);
                        const isGold = i === 0, isSilver = i === 1, isBronze = i === 2;
                        const posColor = isGold ? '#b87a28' : isSilver ? '#7a90a8' : isBronze ? '#a06848' : undefined;
                        return (
                            <div
                                key={member.id}
                                className="lb-row"
                                style={{
                                    animationDelay: `${0.04 + i * 0.03}s`,
                                }}
                            >
                                <div className="avatar avatar-sm" style={{ marginLeft: '12px' }}>{member.username[0].toUpperCase()}</div>
                                <div style={{ flex: 1 }}>
                                    <Link href={`/user/${member.username}`} style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--ink)', textDecoration: 'none' }}>
                                        {member.username}
                                    </Link>
                                    <span className={`rank-badge ${rank.cls}`} style={{ marginLeft: '8px' }}>{rank.label}</span>
                                </div>
                                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '14px', fontWeight: 600, color: getRatingColor(member.rating) }}>
                                    {member.rating}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {isTeacherOfGroup && (
                <div style={{ marginTop: '28px' }}>
                    <p className="sec-label" style={{ marginBottom: '12px' }}>Teacher Dashboard</p>
                    <TeacherDashboardClient group={group} embedded />
                </div>
            )}

        </div>
    );
}
