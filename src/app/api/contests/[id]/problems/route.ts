import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, statement, correctAnswer, points } = body;

        if (!title || !statement || !correctAnswer || !points) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const problem = await prisma.problem.create({
            data: {
                title,
                statement,
                correctAnswer,
                points: Number(points),
                contestId: params.id
            }
        });

        return NextResponse.json(problem);
    } catch (e) {
        console.error("Error creating problem:", e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
