import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ contest: null });

    const now = new Date();
    try {
        const liveReg = await prisma.registration.findFirst({
            where: {
                userId: session.user.id,
                isVirtual: false,
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

        if (liveReg) {
            const personalEndTime = liveReg.startTime
                ? new Date(liveReg.startTime.getTime() + liveReg.contest.duration * 60_000)
                : liveReg.contest.endTime;

            return NextResponse.json({ contest: { ...liveReg.contest, personalEndTime, mode: 'live' } });
        }

        const virtualReg = await prisma.registration.findFirst({
            where: {
                userId: session.user.id,
                isVirtual: true,
                startTime: { not: null },
            },
            orderBy: { startTime: 'desc' },
            include: {
                contest: {
                    select: { id: true, title: true, endTime: true, startTime: true, duration: true },
                },
            },
        });

        if (!virtualReg?.startTime) return NextResponse.json({ contest: null });

        const personalEndTime = new Date(virtualReg.startTime.getTime() + virtualReg.contest.duration * 60_000);
        if (personalEndTime.getTime() <= now.getTime()) return NextResponse.json({ contest: null });

        return NextResponse.json({ contest: { ...virtualReg.contest, personalEndTime, mode: 'virtual' } });
    } catch {
        return NextResponse.json({ contest: null });
    }
}
