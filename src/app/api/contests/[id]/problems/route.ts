import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createProblemSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long').trim(),
    statement: z.string().min(10, 'Statement must be at least 10 characters').max(50000, 'Statement too long'),
    correctAnswer: z.string().min(1, 'Answer is required').max(500, 'Answer too long').trim(),
    points: z.number().int('Points must be a whole number').min(1, 'Points must be at least 1').max(10000, 'Points cannot exceed 10,000'),
    hint: z.string().max(2000, 'Hint too long').optional().nullable(),
});

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        let body: unknown;
        try { body = await req.json(); } catch { return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 }); }

        const result = createProblemSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
        }
        const { title, statement, correctAnswer, points, hint } = result.data;

        const problem = await prisma.problem.create({
            data: {
                title,
                statement,
                correctAnswer,
                points,
                hint: hint || null,
                contestId: params.id
            }
        });

        return NextResponse.json(problem);
    } catch (e) {
        console.error("Error creating problem:", e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
