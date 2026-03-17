import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const contest = await prisma.contest.findUnique({
        where: { id: params.id },
    });
    if (!contest) return new NextResponse("Contest not found", { status: 404 });

    const now = new Date();

    // Only allow virtual participation for past individual contests
    if (now <= contest.endTime) {
        return NextResponse.json({ error: "Contest has not ended yet. Virtual participation is only for past contests." }, { status: 400 });
    }
    if (contest.contestType !== 'individual') {
        return NextResponse.json({ error: "Virtual participation is only supported for individual contests." }, { status: 400 });
    }

    // Since users can participate multiple times, we just create a new record.
    // We could check if they have one currently active to be safe, but creating a new one is more flexible.

    const registration = await prisma.registration.create({
        data: {
            userId: session.user.id,
            contestId: contest.id,
            isVirtual: true,
            startTime: now,
        },
    });

    return NextResponse.json({ success: true, registrationId: registration.id });
}
