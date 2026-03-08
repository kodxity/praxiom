import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateProblemSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long').trim().optional(),
    statement: z.string().min(10, 'Statement must be at least 10 characters').max(50000, 'Statement too long').optional(),
    correctAnswer: z.string().min(1, 'Answer is required').max(500, 'Answer too long').trim().optional(),
    points: z.number().int('Points must be a whole number').min(1, 'Points must be at least 1').max(10000, 'Points cannot exceed 10,000').optional(),
});

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
        let body: unknown;
        try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

        const result = updateProblemSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }
        const { title, statement, correctAnswer, points } = result.data;
        const problem = await prisma.problem.update({
            where: { id: params.problemId },
            data: {
                ...(title !== undefined && { title }),
                ...(statement !== undefined && { statement }),
                ...(correctAnswer !== undefined && { correctAnswer }),
                ...(points !== undefined && { points }),
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
