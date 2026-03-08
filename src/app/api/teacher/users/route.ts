import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/** PUT — approve or deny a student in the teacher's group */
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.isTeacher) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId, action } = await req.json();

    try {
        // Verify the student belongs to this teacher's group
        const group = await prisma.orgGroup.findUnique({
            where: { teacherId: session.user.id },
        });
        if (!group) return new NextResponse('No group found', { status: 404 });

        const student = await prisma.user.findUnique({ where: { id: userId } });
        if (!student || student.groupId !== group.id) {
            return new NextResponse('Student not in your group', { status: 403 });
        }

        if (action === 'approve') {
            await prisma.user.update({ where: { id: userId }, data: { isApproved: true } });
            return NextResponse.json({ ok: true });
        }

        if (action === 'deny') {
            // Remove from group and delete the pending user
            await prisma.user.delete({ where: { id: userId } });
            return NextResponse.json({ ok: true });
        }

        return new NextResponse('Invalid action', { status: 400 });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
