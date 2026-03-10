import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit, rateLimitResponse, getIp } from "@/lib/rateLimit";

const updateResourceSchema = z.object({
    title: z.string().min(1).max(200).trim().optional(),
    content: z.string().min(1).max(100000).optional(),
    visibility: z.enum(['PUBLIC', 'SCHOOL_ONLY']).optional(),
});

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const ip = getIp(req);
    if (!checkRateLimit(`resource-view:ip:${ip}`, { windowMs: 60_000, max: 120 })) {
        return rateLimitResponse();
    }

    const resource = await prisma.resource.findUnique({
        where: { id },
        include: {
            author: { select: { username: true, isAdmin: true, isTeacher: true } },
            school: { select: { name: true, shortName: true } },
        },
    });

    if (!resource) return new NextResponse("Not Found", { status: 404 });

    if (resource.visibility === 'SCHOOL_ONLY') {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { schoolId: true },
        });

        if (!user?.schoolId || user.schoolId !== resource.schoolId) {
            return new NextResponse("Forbidden", { status: 403 });
        }
    }

    return NextResponse.json(resource);
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
    if (!session.user.isAdmin && !session.user.isTeacher) return new NextResponse("Forbidden", { status: 403 });

    const resource = await prisma.resource.findUnique({ where: { id }, select: { authorId: true } });
    if (!resource) return new NextResponse("Not Found", { status: 404 });

    if (!session.user.isAdmin && resource.authorId !== session.user.id) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    if (!checkRateLimit(`resource-update:user:${session.user.id}`, { windowMs: 60_000, max: 20 })) {
        return rateLimitResponse();
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const result = updateResourceSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

    const { title, content, visibility } = result.data;
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (visibility !== undefined) {
        updateData.visibility = visibility;
        if (visibility === 'SCHOOL_ONLY') {
            const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { schoolId: true } });
            if (!user?.schoolId) return NextResponse.json({ error: 'You must be associated with a school.' }, { status: 400 });
            updateData.schoolId = user.schoolId;
        } else {
            updateData.schoolId = null;
        }
    }

    const updated = await prisma.resource.update({ where: { id }, data: updateData });
    return NextResponse.json(updated);
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
    if (!session.user.isAdmin && !session.user.isTeacher) return new NextResponse("Forbidden", { status: 403 });

    const resource = await prisma.resource.findUnique({ where: { id }, select: { authorId: true } });
    if (!resource) return new NextResponse("Not Found", { status: 404 });

    if (!session.user.isAdmin && resource.authorId !== session.user.id) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    await prisma.resource.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
}
