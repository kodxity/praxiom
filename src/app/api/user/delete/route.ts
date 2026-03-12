import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    let body: unknown;
    try { body = await req.json(); } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { username, password } = body as { username?: string; password?: string };

    if (!username) {
        return NextResponse.json({ error: 'Username is required.' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true, username: true, password: true },
    });
    if (!targetUser) return new NextResponse('Not found', { status: 404 });

    const sessionUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, isAdmin: true },
    });

    if (!sessionUser?.isAdmin) {
        if (targetUser.id !== session.user.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        if (!password) {
            return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
        }
        const valid = await compare(password, targetUser.password);
        if (!valid) {
            return NextResponse.json({ error: 'Incorrect password.' }, { status: 400 });
        }
    }

    const deletedUsername = `deleted-${targetUser.id.slice(-8)}`;

    await prisma.$transaction([
        // Remove group memberships and join requests
        prisma.groupMember.deleteMany({ where: { userId: targetUser.id } }),
        prisma.groupJoinRequest.deleteMany({ where: { userId: targetUser.id } }),
        // Remove contest registrations
        prisma.registration.deleteMany({ where: { userId: targetUser.id } }),
        // Remove hint reveals
        prisma.hintReveal.deleteMany({ where: { userId: targetUser.id } }),
        // Remove message reads
        prisma.groupMessageRead.deleteMany({ where: { userId: targetUser.id } }),
        // Anonymize the user record — keep row so submissions/ratings display "deleted-…"
        prisma.user.update({
            where: { id: targetUser.id },
            data: {
                username: deletedUsername,
                email: null,
                displayName: null,
                description: null,
                // Unusable password hash — 60 chars of underscores
                password: '____________________________________________________________',
                isApproved: true,
                isTeacher: false,
                isAdmin: false,
            },
        }),
    ]);

    return NextResponse.json({ ok: true });
}
