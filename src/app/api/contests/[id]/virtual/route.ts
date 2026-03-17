import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const contest = await prisma.contest.findUnique({
        where: { id: params.id },
    });
    if (!contest) return new NextResponse("Contest not found", { status: 404 });

    const now = new Date();

    // Only allow virtual participation for past individual contests
    if (now <= contest.endTime) {
        return NextResponse.json({ error: "Contest has not ended yet. Virtual participation is only for past contests." }, { status: 400 });
    }
    if (contest.contestType !== 'individual') {
        return NextResponse.json({ error: "Virtual participation is only supported for individual contests." }, { status: 400 });
    }

    // Only allow one active virtual contest at a time
    const activeVirtual = await prisma.registration.findFirst({
        where: { userId: session.user.id, isVirtual: true, startTime: { not: null } },
        orderBy: { startTime: 'desc' },
        include: { contest: { select: { id: true, title: true, duration: true } } },
    });
    if (activeVirtual?.startTime) {
        const end = new Date(activeVirtual.startTime.getTime() + (activeVirtual.contest.duration ?? 0) * 60000);
        if (end > now) {
            return NextResponse.json(
                { error: `You already have an active virtual contest: ${activeVirtual.contest.title}` },
                { status: 400 }
            );
        }
    }

    const registration = await prisma.registration.create({
        data: {
            userId: session.user.id,
            contestId: contest.id,
            isVirtual: true,
            startTime: now,
        },
    });

    return NextResponse.json({ success: true, registrationId: registration.id });
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const contest = await prisma.contest.findUnique({
        where: { id: params.id },
        select: { id: true, duration: true },
    });
    if (!contest) return new NextResponse("Contest not found", { status: 404 });

    const reg = await prisma.registration.findFirst({
        where: {
            userId: session.user.id,
            contestId: params.id,
            isVirtual: true,
            startTime: { not: null },
        },
        orderBy: { startTime: 'desc' },
    });
    if (!reg?.startTime) {
        return NextResponse.json({ error: "No active virtual participation found." }, { status: 400 });
    }

    const now = new Date();
    const end = new Date(reg.startTime.getTime() + (contest.duration ?? 0) * 60000);
    if (end <= now) {
        return NextResponse.json({ success: true });
    }

    const forcedStart = new Date(now.getTime() - (contest.duration ?? 0) * 60000);
    await prisma.registration.update({
        where: { id: reg.id },
        data: { startTime: forcedStart },
    });

    return NextResponse.json({ success: true });
 }
