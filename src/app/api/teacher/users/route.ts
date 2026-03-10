import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const teacherActionSchema = z.object({
    userId: z.string().min(1, 'userId is required').optional(),
    username: z.string().min(1, 'username is required').optional(),
    action: z.enum(['approve', 'deny', 'approve_request', 'deny_request', 'add', 'remove']),
});

/** PUT - approve or deny a student in the teacher's group */
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.isTeacher) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const result = teacherActionSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const { userId, username, action } = result.data;

    try {
        // Verify the student belongs to this teacher's group
        const group = await prisma.orgGroup.findUnique({
            where: { teacherId: session.user.id },
        });
        if (!group) return new NextResponse('No group found', { status: 404 });

        if (action === 'add') {
            if (!username && !userId) return NextResponse.json({ error: 'username or userId required' }, { status: 400 });
            const target = userId
                ? await prisma.user.findUnique({ where: { id: userId } })
                : await prisma.user.findUnique({ where: { username: username! } });
            if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
            if (target.isTeacher || target.isAdmin) return new NextResponse('Only student users can be added', { status: 403 });

            await prisma.user.update({
                where: { id: target.id },
                data: { groupId: group.id, isApproved: true },
            });
            await prisma.groupJoinRequest.deleteMany({
                where: { groupId: group.id, userId: target.id },
            });
            return NextResponse.json({ ok: true });
        }

        if (action === 'remove') {
            if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
            const student = await prisma.user.findUnique({ where: { id: userId } });
            if (!student || student.groupId !== group.id) {
                return new NextResponse('Student not in your group', { status: 403 });
            }
            if (student.isTeacher || student.isAdmin) return new NextResponse('Only student users can be removed', { status: 403 });
            await prisma.user.update({ where: { id: userId }, data: { groupId: null } });
            return NextResponse.json({ ok: true });
        }

        if (action === 'approve_request' || action === 'deny_request') {
            if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
            const req = await prisma.groupJoinRequest.findUnique({
                where: { groupId_userId: { groupId: group.id, userId } },
            });
            if (!req || req.status !== 'PENDING') {
                return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
            }
            if (action === 'approve_request') {
                await prisma.user.update({
                    where: { id: userId },
                    data: { groupId: group.id, isApproved: true },
                });
                await prisma.groupJoinRequest.update({
                    where: { groupId_userId: { groupId: group.id, userId } },
                    data: { status: 'ACCEPTED' },
                });
                return NextResponse.json({ ok: true });
            }
            await prisma.groupJoinRequest.update({
                where: { groupId_userId: { groupId: group.id, userId } },
                data: { status: 'REJECTED' },
            });
            return NextResponse.json({ ok: true });
        }

        // approve/deny pending account (student already attached to group but not approved)
        if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        const student = await prisma.user.findUnique({ where: { id: userId } });
        if (!student || student.groupId !== group.id) {
            return new NextResponse('Student not in your group', { status: 403 });
        }

        if (action === 'approve') {
            await prisma.user.update({ where: { id: userId }, data: { isApproved: true } });
            return NextResponse.json({ ok: true });
        }

        // action === 'deny': remove from group and delete the pending user
        await prisma.user.delete({ where: { id: userId } });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
