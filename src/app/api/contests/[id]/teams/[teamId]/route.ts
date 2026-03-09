import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string; teamId: string }> };

// GET /api/contests/[id]/teams/[teamId]
export async function GET(_req: Request, props: Params) {
    const { id: contestId, teamId } = await props.params;
    const team = await prisma.contestTeam.findFirst({
        where: { id: teamId, contestId },
        include: {
            members: {
                include: { user: { select: { id: true, username: true, displayName: true } } },
                orderBy: { joinedAt: 'asc' },
            },
            leader: { select: { id: true, username: true, displayName: true } },
            invites: {
                where: { status: 'PENDING' },
                include: {
                    invitedUser: { select: { id: true, username: true, displayName: true } },
                    invitedByUser: { select: { id: true, username: true, displayName: true } },
                },
            },
            joinRequests: {
                where: { status: 'PENDING' },
                include: { user: { select: { id: true, username: true, displayName: true } } },
            },
        },
    });
    if (!team) return new NextResponse("Not Found", { status: 404 });
    return NextResponse.json(team);
}

// DELETE /api/contests/[id]/teams/[teamId] — disband (leader only, before start)
export async function DELETE(_req: Request, props: Params) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id: contestId, teamId } = await props.params;

    const team = await prisma.contestTeam.findFirst({
        where: { id: teamId, contestId },
        include: { contest: { select: { startTime: true } } },
    });
    if (!team) return new NextResponse("Not Found", { status: 404 });

    if (team.leaderUserId !== session.user.id && !session.user.isAdmin) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    const now = new Date();
    if (now >= team.contest.startTime) {
        return NextResponse.json({ error: 'Cannot disband team after contest start.' }, { status: 403 });
    }

    await prisma.contestTeam.delete({ where: { id: teamId } });
    return new NextResponse(null, { status: 204 });
}
