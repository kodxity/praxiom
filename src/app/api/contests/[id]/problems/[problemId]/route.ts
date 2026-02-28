import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, props: { params: Promise<{ problemId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const params = await props.params;
    try {
        const problem = await prisma.problem.findUnique({ where: { id: params.problemId } });
        if (!problem) return new NextResponse("Not Found", { status: 404 });
        return NextResponse.json(problem);
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PATCH(req: Request, props: { params: Promise<{ problemId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const params = await props.params;
    try {
        const body = await req.json();
        const { title, statement, correctAnswer, points } = body;
        const problem = await prisma.problem.update({
            where: { id: params.problemId },
            data: {
                ...(title !== undefined && { title }),
                ...(statement !== undefined && { statement }),
                ...(correctAnswer !== undefined && { correctAnswer }),
                ...(points !== undefined && { points: Number(points) }),
            },
        });
        return NextResponse.json(problem);
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(_req: Request, props: { params: Promise<{ problemId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const params = await props.params;
    try {
        await prisma.submission.deleteMany({ where: { problemId: params.problemId } });
        await prisma.problem.delete({ where: { id: params.problemId } });
        return new NextResponse(null, { status: 204 });
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
