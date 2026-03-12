import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { compare, hash } from 'bcryptjs';
import { z } from 'zod';
import { checkRateLimit, rateLimitResponse, getIp } from '@/lib/rateLimit';

const schema = z.object({
    username: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    // 10 attempts per 15 minutes per user to guard against brute-force
    const ip = getIp(req);
    if (!checkRateLimit(`change-password:user:${session.user.id}:ip:${ip}`, { windowMs: 15 * 60_000, max: 10 })) {
        return rateLimitResponse();
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
            { status: 400 },
        );
    }

    const { username, currentPassword, newPassword } = parsed.data;

    const sessionUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, isAdmin: true }
    });

    let targetUserId = session.user.id;
    if (username) {
        const targetUser = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        });
        if (!targetUser) return new NextResponse('Not found', { status: 404 });
        if (targetUser.id !== session.user.id && !sessionUser?.isAdmin) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        targetUserId = targetUser.id;
    }

    const targetUserFull = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { password: true },
    });

    if (!targetUserFull) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (!sessionUser?.isAdmin || targetUserId === session.user.id) {
        if (!currentPassword) {
            return NextResponse.json({ error: 'Current password is required.' }, { status: 400 });
        }
        const isValid = await compare(currentPassword, targetUserFull.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
        }
    }

    const hashedPassword = await hash(newPassword, 12);

    await prisma.user.update({
        where: { id: targetUserId },
        data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password updated successfully.' });
}
