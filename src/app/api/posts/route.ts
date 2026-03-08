import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createPostSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters').trim(),
    content: z.string().min(1, 'Content is required').max(100000, 'Content cannot exceed 100,000 characters'),
    isAnnouncement: z.boolean().optional(),
});

export async function GET() {
    const posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { username: true, isAdmin: true } }, _count: { select: { comments: true } } },
    });
    return NextResponse.json(posts);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const result = createPostSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const { title, content, isAnnouncement } = result.data;

    const isAdmin = session.user.isAdmin ?? false;

    const post = await prisma.blogPost.create({
        data: {
            title,
            content,
            isAnnouncement: isAdmin && !!isAnnouncement,
            authorId: session.user.id
        }
    });

    return NextResponse.json(post);
}
