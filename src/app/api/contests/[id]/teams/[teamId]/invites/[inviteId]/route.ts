import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ id: string; teamId: string; inviteId: string }> };

const patchSchema = z.object({
    action: z.enum(['accept', 'decline', 'revoke']),
});

// PATCH /api/contests/[id]/teams/[teamId]/invites/[inviteId]
export async function PATCH(req: Request, props: Params) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id: contestId, teamId, inviteId } = await props.params;

    const invite = await prisma.contestTeamInvite.findFirst({
        where: { id: inviteId, teamId, contestId },
        include: {
            team: {
                include: {
                    contest: { select: { startTime: true } },
                    members: true,
                },
            },
        },
    });
    if (!invite) return new NextResponse("Not Found", { status: 404 });
    if (invite.status !== 'PENDING') {
        return NextResponse.json({ error: 'Invite is no longer pending.' }, { status: 409 });
    }

    const now = new Date();
    if (now >= invite.team.contest.startTime) {
        return NextResponse.json({ error: 'Team is frozen after contest start.' }, { status: 403 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
    const result = patchSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

    const { action } = result.data;

    if (action === 'revoke') {
        // Only leader or admin can revoke
        if (invite.team.leaderUserId !== session.user.id && !session.user.isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }
        await prisma.contestTeamInvite.update({ where: { id: inviteId }, data: { status: 'REVOKED' } });
        return NextResponse.json({ status: 'REVOKED' });
    }

    // accept or decline — must be the invited user
    if (invite.invitedUserId !== session.user.id) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    if (action === 'decline') {
        await prisma.contestTeamInvite.update({ where: { id: inviteId }, data: { status: 'DECLINED' } });
        return NextResponse.json({ status: 'DECLINED' });
    }

    // action === 'accept'
    // Check user not already on another team in this contest (race condition safe with transaction)
    const updated = await prisma.$transaction(async (tx) => {
        // Re-fetch inside transaction for locking
        const currentMembership = await tx.contestTeamMember.findFirst({
            where: { userId: session.user.id, team: { contestId } },
        });
        if (currentMembership) {
            throw new Error('ALREADY_MEMBER');
        }

        // Check team still has space
        const memberCount = await tx.contestTeamMember.count({ where: { teamId } });
        if (memberCount >= invite.team.maxSize) {
            throw new Error('TEAM_FULL');
        }

        // Add member
        await tx.contestTeamMember.create({
            data: { teamId, userId: session.user.id, role: 'member' },
        });

        // Mark this invite as accepted
        await tx.contestTeamInvite.update({ where: { id: inviteId }, data: { status: 'ACCEPTED' } });

        // Invalidate all other pending invites for this user in this contest
        await tx.contestTeamInvite.updateMany({
            where: { contestId, invitedUserId: session.user.id, status: 'PENDING', id: { not: inviteId } },
            data: { status: 'EXPIRED' },
        });

        // Invalidate all pending join requests for this user in this contest
        await tx.contestTeamJoinRequest.updateMany({
            where: { contestId, userId: session.user.id, status: 'PENDING' },
            data: { status: 'EXPIRED' },
        });

        return { status: 'ACCEPTED' };
    }).catch((e: Error) => {
        if (e.message === 'ALREADY_MEMBER') return { error: 'You are already on a team for this contest.', code: 409 };
        if (e.message === 'TEAM_FULL') return { error: 'Team is full — cannot accept invite.', code: 409 };
        throw e;
    });

    if ('error' in updated) {
        return NextResponse.json({ error: updated.error }, { status: updated.code });
    }

    return NextResponse.json(updated);
}
