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

    if (now < contest.startTime) {
        return new NextResponse("Contest has not started yet.", { status: 400 });
    }
    if (now > contest.endTime) {
        return new NextResponse("Contest already ended.", { status: 400 });
    }

    if (contest.contestType === 'individual') {
        const reg = await prisma.registration.findUnique({
            where: { userId_contestId: { userId: session.user.id, contestId: contest.id } }
        });
        if (!reg) return new NextResponse("You are not registered.", { status: 400 });
        if (reg.startTime) return new NextResponse("Contest already started.", { status: 400 });

        await prisma.registration.update({
            where: { id: reg.id },
            data: { startTime: new Date() }
        });
        return NextResponse.json({ success: true });
    } else {
        const membership = await prisma.contestTeamMember.findFirst({
            where: { userId: session.user.id, team: { contestId: contest.id } },
            include: { team: true }
        });
        if (!membership) return new NextResponse("You are not on a team.", { status: 400 });
        if (membership.team.startTime) return new NextResponse("Contest already started.", { status: 400 });
        
        // Only leader can start? Or anyone on team? Let anyone on the team start it for simplicity.
        await prisma.contestTeam.update({
            where: { id: membership.teamId },
            data: { startTime: new Date() }
        });
        return NextResponse.json({ success: true });
    }
}
