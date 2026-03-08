import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Security: verify caller is a member (or teacher) of the group
async function assertMember(groupId: string, userId: string) {
    const group = await prisma.orgGroup.findUnique({
        where: { id: groupId },
        select: {
            teacherId: true,
            members: { where: { id: userId }, select: { id: true } },
        },
    });
    if (!group) return false;
    return group.teacherId === userId || group.members.length > 0;
}

// GET /api/groups/[id]/chat — fetch messages + mark all as read for caller
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: groupId } = await params;
    if (!(await assertMember(groupId, session.user.id))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.groupMessage.findMany({
        where: { groupId },
        orderBy: { createdAt: 'asc' },
        take: 200,
        select: {
            id: true,
            content: true,
            createdAt: true,
            author: { select: { id: true, username: true } },
            reads: { select: { userId: true, user: { select: { username: true } } } },
        },
    });

    // Mark all unread messages as read for this user
    const unreadIds = messages
        .filter(m => m.author.id !== session.user.id && !m.reads.some(r => r.userId === session.user.id))
        .map(m => m.id);

    if (unreadIds.length > 0) {
        await prisma.groupMessageRead.createMany({
            data: unreadIds.map(messageId => ({ messageId, userId: session.user.id })),
            skipDuplicates: true,
        });
    }

    return NextResponse.json(messages);
}

// POST /api/groups/[id]/chat — send a message
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: groupId } = await params;
    if (!(await assertMember(groupId, session.user.id))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const raw: string = body?.content ?? '';
    // Sanitize: strip HTML tags, trim, limit length
    const content = raw.replace(/<[^>]*>/g, '').trim().slice(0, 2000);
    if (!content) return NextResponse.json({ error: 'Empty message' }, { status: 400 });

    const message = await prisma.groupMessage.create({
        data: { groupId, authorId: session.user.id, content },
        select: {
            id: true,
            content: true,
            createdAt: true,
            author: { select: { id: true, username: true } },
            reads: { select: { userId: true, user: { select: { username: true } } } },
        },
    });

    return NextResponse.json(message, { status: 201 });
}
