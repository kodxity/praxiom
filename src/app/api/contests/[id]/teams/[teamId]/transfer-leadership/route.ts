import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ id: string; teamId: string }> };

const schema = z.object({
    newLeaderUserId: z.string().min(1),
});

// POST /api/contests/[id]/teams/[teamId]/transfer-leadership
export async function POST(req: Request, props: Params) {
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
    if (team.leaderUserId !== session.user.id) return new NextResponse("Forbidden", { status: 403 });

    const now = new Date();
    if (now >= team.contest.startTime) {
        return NextResponse.json({ error: 'Cannot transfer leadership after contest start.' }, { status: 403 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
    const result = schema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

    const { newLeaderUserId } = result.data;

    const newLeaderMembership = team.members.find(m => m.userId === newLeaderUserId);
    if (!newLeaderMembership) {
        return NextResponse.json({ error: 'New leader must already be a team member.' }, { status: 400 });
    }
    if (newLeaderUserId === session.user.id) {
        return NextResponse.json({ error: 'You are already the leader.' }, { status: 400 });
    }

    await prisma.$transaction([
        prisma.contestTeam.update({
            where: { id: teamId },
            data: { leaderUserId: newLeaderUserId },
        }),
        prisma.contestTeamMember.updateMany({
            where: { teamId, userId: newLeaderUserId },
            data: { role: 'leader' },
        }),
        prisma.contestTeamMember.updateMany({
            where: { teamId, userId: session.user.id },
            data: { role: 'member' },
        }),
    ]);

    return NextResponse.json({ success: true });
}
