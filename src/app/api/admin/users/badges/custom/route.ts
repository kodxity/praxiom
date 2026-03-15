import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const assignBadgeSchema = z.object({
    userId: z.string().min(1, "userId is required"),
    badgeId: z.string().min(1, "badgeId is required"),
});

// POST /api/admin/users/badges/custom — assign badge to user
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const result = assignBadgeSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json(
            { error: result.error.issues[0].message },
            { status: 400 }
        );
    }

    const { userId, badgeId } = result.data;

    try {
        await prisma.userBadge.upsert({
            where: { userId_badgeId: { userId, badgeId } },
            create: { userId, badgeId },
            update: {},
        });
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json(
            { error: e.message || "Server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/users/badges/custom — remove badge from user
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const result = assignBadgeSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json(
            { error: result.error.issues[0].message },
            { status: 400 }
        );
    }

    const { userId, badgeId } = result.data;

    try {
        await prisma.userBadge.deleteMany({
            where: { userId, badgeId },
        });
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json(
            { error: e.message || "Server error" },
            { status: 500 }
        );
    }
}
