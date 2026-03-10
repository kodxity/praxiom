import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/** GET - pending students applying to the teacher's group */
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.isTeacher) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const group = await prisma.orgGroup.findUnique({
            where: { teacherId: session.user.id },
        });
        if (!group) return NextResponse.json([]);

        const pendingAccounts = await prisma.user.findMany({
            where: { groupId: group.id, isApproved: false },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                displayName: true,
                email: true,
                createdAt: true,
                school: { select: { shortName: true } },
            },
        });
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
            ...pendingAccounts.map(p => ({ kind: 'account' as const, ...p })),
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
