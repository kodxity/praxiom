import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createCommentSchema = z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(5000, 'Comment cannot exceed 5,000 characters').trim(),
});

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const result = createCommentSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const comment = await prisma.comment.create({
        data: {
            content: result.data.content,
            postId: params.id,
            authorId: session.user.id
        }
    });

    return NextResponse.json(comment);
}
