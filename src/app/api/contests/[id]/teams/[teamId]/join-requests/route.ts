import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string; teamId: string }> };

// POST /api/contests/[id]/teams/[teamId]/join-requests — user requests to join
export async function POST(_req: Request, props: Params) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id: contestId, teamId } = await props.params;

    const team = await prisma.contestTeam.findFirst({
        where: { id: teamId, contestId },
        include: {
            contest: { select: { startTime: true } },
            members: true,
        },
    });
    if (!team) return new NextResponse("Not Found", { status: 404 });

    const now = new Date();
    if (now >= team.contest.startTime) {
        return NextResponse.json({ error: 'Team registration is closed.' }, { status: 403 });
    }

    if (team.members.length >= team.maxSize) {
        return NextResponse.json({ error: 'Team is full.' }, { status: 409 });
    }

    // Already a member?
    const alreadyMember = await prisma.contestTeamMember.findFirst({
        where: { userId: session.user.id, team: { contestId } },
    });
    if (alreadyMember) {
        return NextResponse.json({ error: 'You are already on a team for this contest.' }, { status: 409 });
    }

    // Existing pending request for this team?
    const existing = await prisma.contestTeamJoinRequest.findUnique({
        where: { teamId_userId: { teamId, userId: session.user.id } },
    });
    if (existing) {
        if (existing.status === 'PENDING') {
            return NextResponse.json({ error: 'Join request already pending.' }, { status: 409 });
        }
        // Allow re-request if previously rejected/expired
        const updated = await prisma.contestTeamJoinRequest.update({
            where: { id: existing.id },
            data: { status: 'PENDING', updatedAt: new Date() },
        });
        return NextResponse.json(updated, { status: 201 });
    }

    const request = await prisma.contestTeamJoinRequest.create({
        data: { contestId, teamId, userId: session.user.id },
    });

    return NextResponse.json(request, { status: 201 });
}
