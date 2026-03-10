<<<<<<< HEAD
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if contest exists
    const contest = await prisma.contest.findUnique({ where: { id: params.id } });
    if (!contest) return new NextResponse("Contest not found", { status: 404 });

    try {
        await prisma.registration.create({
            data: {
                userId: session.user.id,
                contestId: params.id
            }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        // Unique constraint might fail if already registered
        console.log(e);
        return NextResponse.json({ success: false });
    }
}
=======
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // 10 registration attempts per minute per user
    if (!checkRateLimit(`contest-reg:user:${session.user.id}`, { windowMs: 60_000, max: 10 })) {
        return rateLimitResponse();
    }

    // Check if contest exists and hasn't ended
    const contest = await prisma.contest.findUnique({ where: { id: params.id } });
    if (!contest) return new NextResponse("Contest not found", { status: 404 });
    if (new Date() > contest.endTime) {
        return new NextResponse("This contest has already ended.", { status: 400 });
    }

    try {
        await prisma.registration.create({
            data: {
                userId: session.user.id,
                contestId: params.id
            }
        });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        // P2002 = unique constraint violation — user is already registered
        if (e?.code === 'P2002') {
            return NextResponse.json({ error: 'Already registered for this contest' }, { status: 409 });
        }
        console.error(e);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
>>>>>>> LATESTTHISONE-NEWMODES
