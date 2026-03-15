import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const badgeActionSchema = z.object({
    userId: z.string().min(1, 'userId is required'),
    action: z.enum(['setSchool', 'removeSchool', 'addGroup', 'removeGroup']),
    targetId: z.string().optional(),
});

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const result = badgeActionSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const { userId, action, targetId } = result.data;

    try {
        if (action === 'setSchool') {
            if (!targetId) return NextResponse.json({ error: 'targetId (schoolId) required' }, { status: 400 });
            await prisma.user.update({
                where: { id: userId },
                data: { schoolId: targetId },
            });
            return NextResponse.json({ ok: true });
        }

        if (action === 'removeSchool') {
            await prisma.user.update({
                where: { id: userId },
                data: { schoolId: null },
            });
            return NextResponse.json({ ok: true });
        }

        if (action === 'addGroup') {
            if (!targetId) return NextResponse.json({ error: 'targetId (groupId) required' }, { status: 400 });
            // add to GroupMember
            await prisma.groupMember.upsert({
                where: { groupId_userId: { groupId: targetId, userId } },
                create: { groupId: targetId, userId },
                update: {},
            });
            return NextResponse.json({ ok: true });
        }

        if (action === 'removeGroup') {
            if (!targetId) return NextResponse.json({ error: 'targetId (groupId) required' }, { status: 400 });
            await prisma.groupMember.deleteMany({
                where: { groupId: targetId, userId },
            });
            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
}
