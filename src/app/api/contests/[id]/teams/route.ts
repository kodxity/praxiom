import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createTeamSchema = z.object({
    name: z.string().min(1, 'Team name required').max(60, 'Team name too long').trim(),
    inviteUsernames: z.array(z.string()).max(5).optional(),
});

// GET /api/contests/[id]/teams — list all teams for a contest
export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
    const { id: contestId } = await props.params;
    const contest = await prisma.contest.findUnique({ where: { id: contestId }, select: { contestType: true } });
    if (!contest) return new NextResponse("Not Found", { status: 404 });

    const teams = await prisma.contestTeam.findMany({
        where: { contestId },
        include: {
            members: { include: { user: { select: { id: true, username: true, displayName: true } } } },
            leader: { select: { id: true, username: true, displayName: true } },
        },
        orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(teams);
}

// POST /api/contests/[id]/teams — create a team
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id: contestId } = await props.params;

    const contest = await prisma.contest.findUnique({
        where: { id: contestId },
        select: { contestType: true, startTime: true, endTime: true},
    });
    if (!contest) return new NextResponse("Contest not found", { status: 404 });
    if (contest.contestType === 'individual') {
        return NextResponse.json({ error: 'Individual contests do not use teams.' }, { status: 400 });
    }

    const now = new Date();
    if (now >= contest.startTime) {
        return NextResponse.json({ error: 'Team registration is closed — contest has started.' }, { status: 403 });
    }

    // Check user is not already on a team in this contest
    const existingMembership = await prisma.contestTeamMember.findFirst({
        where: { userId: session.user.id, team: { contestId } },
    });
    if (existingMembership) {
        return NextResponse.json({ error: 'You are already on a team for this contest.' }, { status: 409 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
    const result = createTeamSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    const { name, inviteUsernames } = result.data;

    const maxSize = contest.contestType === 'relay' ? 3 : 6;

    // Create team + leader membership in a transaction
    const team = await prisma.$transaction(async (tx) => {
        const newTeam = await tx.contestTeam.create({
            data: {
                contestId,
                name,
                leaderUserId: session.user.id,
                maxSize,
                status: 'FORMING',
            },
        });

        await tx.contestTeamMember.create({
            data: { teamId: newTeam.id, userId: session.user.id, role: 'leader' },
        });

        // Send invites to specified usernames
        if (inviteUsernames?.length) {
            const invitees = await tx.user.findMany({
                where: { username: { in: inviteUsernames } },
                select: { id: true, username: true },
            });
            for (const invitee of invitees) {
                if (invitee.id === session.user.id) continue;
                // Don't invite someone already on a team
                const alreadyMember = await tx.contestTeamMember.findFirst({
                    where: { userId: invitee.id, team: { contestId } },
                });
                if (alreadyMember) continue;
                await tx.contestTeamInvite.create({
                    data: {
                        contestId,
                        teamId: newTeam.id,
                        invitedUserId: invitee.id,
                        invitedByUserId: session.user.id,
                    },
                });
            }
        }

        return newTeam;
    });

    return NextResponse.json(team, { status: 201 });
}
