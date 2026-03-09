import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ id: string; teamId: string; requestId: string }> };

const patchSchema = z.object({
    action: z.enum(['accept', 'reject']),
});

// PATCH /api/contests/[id]/teams/[teamId]/join-requests/[requestId] — leader accepts/rejects
export async function PATCH(req: Request, props: Params) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id: contestId, teamId, requestId } = await props.params;

    const team = await prisma.contestTeam.findFirst({
        where: { id: teamId, contestId },
        include: {
            contest: { select: { startTime: true } },
            members: true,
        },
    });
    if (!team) return new NextResponse("Not Found", { status: 404 });

    if (team.leaderUserId !== session.user.id && !session.user.isAdmin) {
        return new NextResponse("Forbidden — leaders only", { status: 403 });
    }

    const now = new Date();
    if (now >= team.contest.startTime) {
        return NextResponse.json({ error: 'Team is frozen after contest start.' }, { status: 403 });
    }

    const joinRequest = await prisma.contestTeamJoinRequest.findFirst({
        where: { id: requestId, teamId, contestId },
    });
    if (!joinRequest) return new NextResponse("Not Found", { status: 404 });
    if (joinRequest.status !== 'PENDING') {
        return NextResponse.json({ error: 'Request is no longer pending.' }, { status: 409 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
    const result = patchSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

    const { action } = result.data;

    if (action === 'reject') {
        await prisma.contestTeamJoinRequest.update({ where: { id: requestId }, data: { status: 'REJECTED' } });
        return NextResponse.json({ status: 'REJECTED' });
    }

    // action === 'accept'
    const updated = await prisma.$transaction(async (tx) => {
        // Check user not already on another team (race condition)
        const alreadyMember = await tx.contestTeamMember.findFirst({
            where: { userId: joinRequest.userId, team: { contestId } },
        });
        if (alreadyMember) throw new Error('ALREADY_MEMBER');

        const memberCount = await tx.contestTeamMember.count({ where: { teamId } });
        if (memberCount >= team.maxSize) throw new Error('TEAM_FULL');

        await tx.contestTeamMember.create({
            data: { teamId, userId: joinRequest.userId, role: 'member' },
        });

        await tx.contestTeamJoinRequest.update({ where: { id: requestId }, data: { status: 'ACCEPTED' } });

        // Expire other pending requests and invites for this user in this contest
        await tx.contestTeamJoinRequest.updateMany({
            where: { contestId, userId: joinRequest.userId, status: 'PENDING', id: { not: requestId } },
            data: { status: 'EXPIRED' },
        });
        await tx.contestTeamInvite.updateMany({
            where: { contestId, invitedUserId: joinRequest.userId, status: 'PENDING' },
            data: { status: 'EXPIRED' },
        });

        return { status: 'ACCEPTED' };
    }).catch((e: Error) => {
        if (e.message === 'ALREADY_MEMBER') return { error: 'User is already on a team.', code: 409 };
        if (e.message === 'TEAM_FULL') return { error: 'Team is full.', code: 409 };
        throw e;
    });

    if ('error' in updated) {
        return NextResponse.json({ error: updated.error }, { status: updated.code });
    }

    return NextResponse.json(updated);
}
