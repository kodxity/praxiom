import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ id: string; teamId: string }> };

const inviteSchema = z.object({
    username: z.string().min(1).max(60).trim(),
});

// POST /api/contests/[id]/teams/[teamId]/invites — leader sends invite
export async function POST(req: Request, props: Params) {
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
    if (team.leaderUserId !== session.user.id) return new NextResponse("Forbidden — leaders only", { status: 403 });

    const now = new Date();
    if (now >= team.contest.startTime) {
        return NextResponse.json({ error: 'Team is frozen after contest start.' }, { status: 403 });
    }

    if (team.members.length >= team.maxSize) {
        return NextResponse.json({ error: 'Team is full.' }, { status: 409 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
    const result = inviteSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

    const invitee = await prisma.user.findUnique({
        where: { username: result.data.username },
        select: { id: true, username: true },
    });
    if (!invitee) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    if (invitee.id === session.user.id) return NextResponse.json({ error: 'Cannot invite yourself.' }, { status: 400 });

    // Check not already a member
    const alreadyMember = await prisma.contestTeamMember.findFirst({
        where: { userId: invitee.id, team: { contestId } },
    });
    if (alreadyMember) return NextResponse.json({ error: 'User is already on a team for this contest.' }, { status: 409 });

    // Check no existing pending invite
    const existingInvite = await prisma.contestTeamInvite.findFirst({
        where: { teamId, invitedUserId: invitee.id, status: 'PENDING' },
    });
    if (existingInvite) return NextResponse.json({ error: 'Invite already pending for this user.' }, { status: 409 });

    const invite = await prisma.contestTeamInvite.create({
        data: {
            contestId,
            teamId,
            invitedUserId: invitee.id,
            invitedByUserId: session.user.id,
        },
    });

    return NextResponse.json(invite, { status: 201 });
}
