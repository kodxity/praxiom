import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const contest = await prisma.contest.findUnique({
            where: { id: params.id },
            include: { problems: { orderBy: { points: 'asc' } } },
        });
        if (!contest) return new NextResponse("Not Found", { status: 404 });
        return NextResponse.json(contest);
    } catch (e) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const params = await props.params;
    const body = await req.json();
    const { title, description, startTime, endTime, themeSlug, accentColor, status } = body;

    try {
        const contest = await prisma.contest.update({
            where: { id: params.id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(startTime !== undefined && { startTime: new Date(startTime) }),
                ...(endTime !== undefined && { endTime: new Date(endTime) }),
                ...(themeSlug !== undefined && { themeSlug }),
                ...(accentColor !== undefined && { accentColor: accentColor || null }),
                ...(status !== undefined && { status }),
            },
        });
        return NextResponse.json(contest);
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const params = await props.params;
    try {
        // Delete related records first
        await prisma.submission.deleteMany({ where: { contestId: params.id } });
        await prisma.registration.deleteMany({ where: { contestId: params.id } });
        await prisma.problem.deleteMany({ where: { contestId: params.id } });
        await prisma.contest.delete({ where: { id: params.id } });
        return new NextResponse(null, { status: 204 });
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
