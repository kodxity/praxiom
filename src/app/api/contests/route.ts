import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createContestSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long').trim(),
    description: z.string().max(5000, 'Description too long').optional(),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    themeSlug: z.string().regex(/^[a-z0-9-]*$/, 'Invalid theme slug').max(50).optional(),
    accentColor: z.string().regex(/^(#[0-9A-Fa-f]{6})?$/, 'Invalid hex color').nullable().optional(),
    duration: z.coerce.number().min(1).default(120),
    contestType: z.enum(['individual', 'team', 'relay']).default('individual'),
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const result = createContestSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const { title, description, startTime, endTime, duration, themeSlug, accentColor, contestType } = result.data;

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    if (start >= end) {
        return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 });
    }

    const contest = await prisma.contest.create({
        data: {
            title,
            description: description ?? null,
            startTime: start,
            endTime: end,
            duration,
            status: 'SCHEDULED',
            themeSlug: themeSlug || 'global',
            accentColor: accentColor || null,
            contestType,
        }
    });

    return NextResponse.json(contest);
}
