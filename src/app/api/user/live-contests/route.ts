import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ contest: null });

    const now = new Date();
    try {
        const reg = await prisma.registration.findFirst({
            where: {
                userId: session.user.id,
                contest: {
                    startTime: { lte: now },
                    endTime: { gte: now },
                },
            },
            include: {
                contest: {
                    select: { id: true, title: true, endTime: true, startTime: true },
                },
            },
        });

        if (!reg) return NextResponse.json({ contest: null });
        return NextResponse.json({ contest: reg.contest });
    } catch {
        return NextResponse.json({ contest: null });
    }
}
