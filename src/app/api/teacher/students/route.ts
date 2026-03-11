import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/** GET - all approved students in the teacher's group */
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

        const students = await prisma.groupMember.findMany({
            where: { groupId: group.id, user: { isApproved: true } },
            orderBy: { user: { rating: 'desc' } },
            select: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        rating: true,
                        isAdmin: true,
                        isTeacher: true,
                        createdAt: true,
                        ratingHistory: { orderBy: { createdAt: 'desc' }, take: 1, select: { newRating: true, change: true } },
                        _count: { select: { submissions: true } },
                    },
                },
            },
        });
        return NextResponse.json(students.map(s => s.user));
    } catch {
        return NextResponse.json([], { status: 200 });
    }
}
