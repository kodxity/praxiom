import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// GET /api/admin/badges — list all badges
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const badges = await prisma.badge.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { users: true } },
        },
    });

    return NextResponse.json(badges);
}

const createBadgeSchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name too long"),
    textureUrl: z.string().optional(),
});

// POST /api/admin/badges — create a new badge
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

    const result = createBadgeSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json(
            { error: result.error.issues[0].message },
            { status: 400 }
        );
    }

    const { name, textureUrl } = result.data;

    try {
        const badge = await prisma.badge.create({
            data: { name, textureUrl: textureUrl || null },
        });
        return NextResponse.json(badge, { status: 201 });
    } catch (e: any) {
        if (e.code === "P2002") {
            return NextResponse.json(
                { error: "A badge with this name already exists" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: e.message || "Server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/badges — delete a badge
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const badgeId = searchParams.get("id");
    if (!badgeId) {
        return NextResponse.json({ error: "Badge id required" }, { status: 400 });
    }

    try {
        await prisma.badge.delete({ where: { id: badgeId } });
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json(
            { error: e.message || "Server error" },
            { status: 500 }
        );
    }
}
