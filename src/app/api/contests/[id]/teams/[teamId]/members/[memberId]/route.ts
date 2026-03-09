import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string; teamId: string; memberId: string }> };

// DELETE /api/contests/[id]/teams/[teamId]/members/[memberId]
// Used for: kick (leader kicks member) or leave (member leaves)
export async function DELETE(_req: Request, props: Params) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id: contestId, teamId, memberId } = await props.params;

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
        return NextResponse.json({ error: 'Team is frozen — cannot change members after contest start.' }, { status: 403 });
    }

    const membership = team.members.find(m => m.id === memberId);
    if (!membership) return new NextResponse("Member not found", { status: 404 });

    const isLeader = team.leaderUserId === session.user.id;
    const isSelf = membership.userId === session.user.id;

    if (!isLeader && !isSelf && !session.user.isAdmin) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    // Leader cannot leave without transferring leadership first
    if (membership.userId === team.leaderUserId && !session.user.isAdmin) {
        return NextResponse.json({ error: 'Transfer leadership before leaving.' }, { status: 400 });
    }

    await prisma.contestTeamMember.delete({ where: { id: memberId } });

    // Invalidate pending invites/requests for this user in this contest since they left
    await prisma.contestTeamJoinRequest.updateMany({
        where: { userId: membership.userId, contestId, status: 'PENDING' },
        data: { status: 'EXPIRED' },
    });

    return new NextResponse(null, { status: 204 });
}
