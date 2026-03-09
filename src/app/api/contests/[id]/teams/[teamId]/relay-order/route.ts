import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ id: string; teamId: string }> };

const relayOrderSchema = z.object({
    // Map userId -> slot (1 | 2 | 3), must have exactly 3 entries
    assignments: z.array(z.object({
        userId: z.string(),
        slot: z.number().int().min(1).max(3),
    })).length(3),
});

// PATCH /api/contests/[id]/teams/[teamId]/relay-order
export async function PATCH(req: Request, props: Params) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id: contestId, teamId } = await props.params;

    const team = await prisma.contestTeam.findFirst({
        where: { id: teamId, contestId },
        include: {
            contest: { select: { startTime: true, contestType: true } },
            members: true,
        },
    });
    if (!team) return new NextResponse("Not Found", { status: 404 });
    if (team.contest.contestType !== 'relay') {
        return NextResponse.json({ error: 'Relay order only applies to relay contests.' }, { status: 400 });
    }
    if (team.leaderUserId !== session.user.id && !session.user.isAdmin) {
        return new NextResponse("Forbidden — leaders only", { status: 403 });
    }

    const now = new Date();
    if (now >= team.contest.startTime) {
        return NextResponse.json({ error: 'Relay order is locked after contest start.' }, { status: 403 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
    const result = relayOrderSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

    const { assignments } = result.data;

    // Validate: 3 distinct users, all members, 3 distinct slots
    const userIds = assignments.map(a => a.userId);
    const slots = assignments.map(a => a.slot);
    if (new Set(userIds).size !== 3) return NextResponse.json({ error: 'All 3 members must be distinct.' }, { status: 400 });
    if (new Set(slots).size !== 3) return NextResponse.json({ error: 'All 3 slots must be distinct.' }, { status: 400 });

    const memberIds = team.members.map(m => m.userId);
    for (const uid of userIds) {
        if (!memberIds.includes(uid)) {
            return NextResponse.json({ error: `User ${uid} is not a member of this team.` }, { status: 400 });
        }
    }

    // Update relay order for each member
    await prisma.$transaction(
        assignments.map(a =>
            prisma.contestTeamMember.updateMany({
                where: { teamId, userId: a.userId },
                data: { relayOrder: a.slot },
            })
        )
    );

    return NextResponse.json({ success: true });
}
