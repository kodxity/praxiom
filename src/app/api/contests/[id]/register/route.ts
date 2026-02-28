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
