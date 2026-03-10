import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/** GET - pending students applying to the teacher's group */
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.isTeacher) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const groupId = searchParams.get('groupId');
        if (!groupId) return NextResponse.json({ error: 'groupId is required' }, { status: 400 });

        const group = await prisma.orgGroup.findUnique({
            where: { id: groupId },
            select: { id: true, teacherId: true },
        });
        if (!group) return NextResponse.json([]);
        if (group.teacherId !== session.user.id) return new NextResponse('Forbidden', { status: 403 });

        const joinRequests = await prisma.groupJoinRequest.findMany({
            where: { groupId: group.id, status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        email: true,
                        school: { select: { shortName: true } },
                    },
                },
            },
        });

        const combined = [
            ...joinRequests.map(r => ({
                kind: 'join' as const,
                id: r.user.id,
                username: r.user.username,
                displayName: r.user.displayName,
                email: r.user.email,
                createdAt: r.createdAt,
                school: r.user.school,
                requestId: r.id,
            })),
        ];

        return NextResponse.json(combined);
    } catch {
        return NextResponse.json([], { status: 200 });
    }
}
