import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { compare, hash } from 'bcryptjs';
import { z } from 'zod';
import { checkRateLimit, rateLimitResponse, getIp } from '@/lib/rateLimit';

const schema = z.object({
    currentPassword: z.string().min(1),
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

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const isValid = await compare(currentPassword, user.password);
    if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    const hashedPassword = await hash(newPassword, 12);

    await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password updated successfully.' });
}
