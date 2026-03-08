import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/user/unread-messages
// Returns { count: number } — total unread messages across all groups user belongs to
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ count: 0 });

    const userId = session.user.id;

    // Find all groups the user belongs to (as member or teacher)
    const [memberGroups, taughtGroup] = await Promise.all([
        prisma.orgGroup.findMany({
            where: { members: { some: { id: userId } } },
            select: { id: true },
        }),
        prisma.orgGroup.findFirst({
            where: { teacherId: userId },
            select: { id: true },
        }),
    ]);

    const groupIds = [
        ...memberGroups.map(g => g.id),
        ...(taughtGroup ? [taughtGroup.id] : []),
    ];

    if (groupIds.length === 0) return NextResponse.json({ count: 0 });

    // Count messages in those groups that are NOT authored by this user
    // and have no read receipt for this user
    const count = await prisma.groupMessage.count({
        where: {
            groupId: { in: groupIds },
            authorId: { not: userId },
            reads: { none: { userId } },
        },
    });

    return NextResponse.json({ count });
}
