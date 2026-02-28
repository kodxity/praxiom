import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    const posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { username: true, isAdmin: true } }, _count: { select: { comments: true } } },
    });
    return NextResponse.json(posts);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    // Any approved logged-in user can create a blog post; admin-only for now for announcements
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, content, isAnnouncement } = await req.json();

    // Only admins can create announcements
    const isAdmin = (session.user as any).isAdmin ?? false;

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
