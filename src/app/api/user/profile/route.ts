import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateProfileSchema = z.object({
    description: z.string().max(1000, 'Description must be 1000 characters or fewer').trim().optional(),
    username: z.string().optional(),
});

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const sessionUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, isAdmin: true }
    });

    let targetUserId = session.user.id;
    if (result.data.username) {
        const targetUser = await prisma.user.findUnique({
            where: { username: result.data.username },
            select: { id: true }
        });
        if (!targetUser) return new NextResponse('Not found', { status: 404 });
        if (targetUser.id !== session.user.id && !sessionUser?.isAdmin) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        targetUserId = targetUser.id;
    }

    const user = await prisma.user.update({
        where: { id: targetUserId },
        data: { description: result.data.description },
        select: {
            id: true, username: true, email: true, description: true,
            rating: true, isAdmin: true, isTeacher: true, isApproved: true, createdAt: true,
        },
    });

    return NextResponse.json(user);
}
