import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/** GET - contest results for all students in the teacher's group */
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

        // Get all students in group
        const students = await prisma.groupMember.findMany({
            where: { groupId: group.id, user: { isApproved: true } },
            select: { userId: true },
        });
        const studentIds = students.map(s => s.userId);

        // Get rating history per contest for these students
        const history = await prisma.ratingHistory.findMany({
            where: { userId: { in: studentIds } },
            include: {
                contest: { select: { id: true, title: true, endTime: true } },
                user: { select: { username: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Group by contest
        const byContest = new Map<string, { contest: { id: string; title: string; endTime: Date }; results: { username: string; change: number; newRating: number }[] }>();
        for (const h of history) {
            if (!byContest.has(h.contestId)) {
                byContest.set(h.contestId, { contest: h.contest, results: [] });
            }
            byContest.get(h.contestId)!.results.push({
                username: h.user.username,
                change: h.change,
                newRating: h.newRating,
            });
        }

        return NextResponse.json(Array.from(byContest.values()));
    } catch {
        return NextResponse.json([], { status: 200 });
    }
}
