import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateContestSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long').trim().optional(),
    description: z.string().max(5000, 'Description too long').optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    duration: z.coerce.number().min(1).optional(),
    themeSlug: z.string().regex(/^[a-z0-9-]*$/, 'Invalid theme slug').max(50).optional(),
    accentColor: z.string().regex(/^(#[0-9A-Fa-f]{6})?$/, 'Invalid hex color').nullable().optional(),
    status: z.enum(['SCHEDULED', 'ACTIVE', 'ENDED']).optional(),
    contestType: z.enum(['individual', 'team', 'relay']).optional(),
});

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.isAdmin === true;
    try {
        const contest = await prisma.contest.findUnique({
            where: { id: params.id },
            include: {
                problems: {
                    orderBy: { id: 'asc' },
                    // Never expose correctAnswer to non-admin clients
                    select: {
                        id: true,
                        title: true,
                        statement: true,
                        points: true,
                        hint: true,
                        contestId: true,
                        ...(isAdmin ? { correctAnswer: true } : {}),
                    },
                },
            },
        });
        if (!contest) return new NextResponse("Not Found", { status: 404 });
        return NextResponse.json(contest);
    } catch (e) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const params = await props.params;

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const result = updateContestSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const { title, description, startTime, endTime, duration, themeSlug, accentColor, status, contestType } = result.data;

    // Validate dates if provided
    let start: Date | undefined, end: Date | undefined;
    if (startTime) { start = new Date(startTime); if (isNaN(start.getTime())) return NextResponse.json({ error: 'Invalid start time' }, { status: 400 }); }
    if (endTime)   { end   = new Date(endTime);   if (isNaN(end.getTime()))   return NextResponse.json({ error: 'Invalid end time' },   { status: 400 }); }
    if (start && end && start >= end) {
        return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 });
    }

    try {
        const contest = await prisma.contest.update({
            where: { id: params.id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(start !== undefined && { startTime: start }),
                ...(end !== undefined && { endTime: end }),
                ...(duration !== undefined && { duration }),
                ...(themeSlug !== undefined && { themeSlug }),
                ...(accentColor !== undefined && { accentColor: accentColor || null }),
                ...(status !== undefined && { status }),
                ...(contestType !== undefined && { contestType }),
            },
        });
        return NextResponse.json(contest);
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const params = await props.params;
    try {
        // Delete related records in dependency order
        const problemIds = (await prisma.problem.findMany({
            where: { contestId: params.id },
            select: { id: true },
        })).map(p => p.id);

        if (problemIds.length > 0) {
            await prisma.hintReveal.deleteMany({ where: { problemId: { in: problemIds } } });
        }
        await prisma.submission.deleteMany({ where: { contestId: params.id } });
        await prisma.ratingHistory.deleteMany({ where: { contestId: params.id } });
        await prisma.registration.deleteMany({ where: { contestId: params.id } });
        await prisma.problem.deleteMany({ where: { contestId: params.id } });
        // ContestTeam cascade-deletes members, invites, and join-requests
        await prisma.contest.delete({ where: { id: params.id } });
        return new NextResponse(null, { status: 204 });
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
