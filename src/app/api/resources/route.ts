import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit, rateLimitResponse, getIp } from "@/lib/rateLimit";

const createResourceSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters').trim(),
    content: z.string().min(1, 'Content is required').max(100000, 'Content cannot exceed 100,000 characters'),
    visibility: z.enum(['PUBLIC', 'SCHOOL_ONLY']),
});

export async function GET(req: Request) {
    const ip = getIp(req);
    if (!checkRateLimit(`resources-list:ip:${ip}`, { windowMs: 60_000, max: 60 })) {
        return rateLimitResponse();
    }

    const session = await getServerSession(authOptions);

    let userSchoolId: string | null = null;
    if (session?.user?.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { schoolId: true },
        });
        userSchoolId = user?.schoolId ?? null;
    }

    const resources = await prisma.resource.findMany({
        where: {
            OR: [
                { visibility: 'PUBLIC' },
                ...(userSchoolId ? [{ visibility: 'SCHOOL_ONLY', schoolId: userSchoolId }] : []),
            ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
            author: { select: { username: true, isAdmin: true, isTeacher: true } },
            school: { select: { name: true, shortName: true } },
        },
    });

    return NextResponse.json(resources);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!session.user.isAdmin && !session.user.isTeacher) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    if (!checkRateLimit(`resource-create:user:${session.user.id}`, { windowMs: 60_000, max: 10 })) {
        return rateLimitResponse();
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const result = createResourceSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const { title, content, visibility } = result.data;

    let schoolId: string | null = null;
    if (visibility === 'SCHOOL_ONLY') {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { schoolId: true },
        });
        schoolId = user?.schoolId ?? null;
        if (!schoolId) {
            return NextResponse.json(
                { error: 'You must be associated with a school to create school-only resources.' },
                { status: 400 },
            );
        }
    }

    const resource = await prisma.resource.create({
        data: { title, content, visibility, schoolId, authorId: session.user.id },
    });

    return NextResponse.json(resource, { status: 201 });
}
