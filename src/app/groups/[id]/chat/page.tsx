import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import GroupChatClient from './GroupChatClient';

export default async function GroupChatPage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) redirect('/login');

    let group: { id: string; name: string; teacherId: string; members: { userId: string }[] } | null = null;
    try {
        group = await prisma.orgGroup.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                teacherId: true,
                members: { where: { userId: session.user.id }, select: { userId: true } },
            },
        });
    } catch { notFound(); }

    if (!group) notFound();

    // Security: only members and the teacher can access the chat
    const isMember = group.teacherId === session.user.id || group.members.length > 0;
    if (!isMember) redirect(`/groups/${id}`);

    return <GroupChatClient groupId={id} groupName={group.name} />;
}
