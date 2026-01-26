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

    const { content } = await req.json();

    const comment = await prisma.comment.create({
        data: {
            content,
            postId: params.id,
            authorId: session.user.id
        }
    });

    return NextResponse.json(comment);
}
