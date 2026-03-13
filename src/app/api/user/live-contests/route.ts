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
                    select: { id: true, title: true, endTime: true, startTime: true, duration: true },
                },
            },
        });

        if (!reg) return NextResponse.json({ contest: null });

        const personalEndTime = reg.startTime
            ? new Date(reg.startTime.getTime() + reg.contest.duration * 60_000)
            : reg.contest.endTime;

        return NextResponse.json({ contest: { ...reg.contest, personalEndTime } });
    } catch {
        return NextResponse.json({ contest: null });
    }
}
