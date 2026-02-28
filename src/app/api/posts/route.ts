import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, content } = await req.json();

    const post = await prisma.blogPost.create({
        data: {
            title,
            content,
            authorId: session.user.id
        }
    });

    return NextResponse.json(post);
}
