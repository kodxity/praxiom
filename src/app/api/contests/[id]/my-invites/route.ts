import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/contests/[id]/my-invites — pending invites for the current user in this contest
export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id: contestId } = await props.params;

    const invites = await prisma.contestTeamInvite.findMany({
        where: { contestId, invitedUserId: session.user.id, status: 'PENDING' },
        include: {
            team: {
                include: {
                    members: { include: { user: { select: { id: true, username: true } } } },
                    leader: { select: { id: true, username: true } },
                },
            },
            invitedByUser: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invites);
}
