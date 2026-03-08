import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/** GET — all approved students in the teacher's group */
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

        const students = await prisma.user.findMany({
            where: { groupId: group.id, isApproved: true },
            orderBy: { rating: 'desc' },
            select: {
                id: true,
                username: true,
                rating: true,
                createdAt: true,
                ratingHistory: { orderBy: { createdAt: 'desc' }, take: 1, select: { newRating: true, change: true } },
                _count: { select: { submissions: true } },
            },
        });
        return NextResponse.json(students);
    } catch {
        return NextResponse.json([], { status: 200 });
    }
}
