import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const adminActionSchema = z.object({
    userId: z.string().min(1, 'userId is required'),
    action: z.enum(['approve', 'deny', 'setTeacher', 'setStudent']),
});

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const result = adminActionSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const { userId, action } = result.data;

    if (action === 'approve') {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { isApproved: true },
            select: {
                id: true, username: true, email: true, isApproved: true,
                isTeacher: true, isAdmin: true, createdAt: true,
            },
        });
        return NextResponse.json(user);
    }

    if (action === 'setTeacher') {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { isTeacher: true },
        });
        return NextResponse.json(user);
    }

    if (action === 'setStudent') {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { isTeacher: false },
        });
        return NextResponse.json(user);
    }

    // action === 'deny'
    // For teachers: also delete their pending group
    await prisma.orgGroup.deleteMany({ where: { teacherId: userId } });
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ ok: true });
}
