import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateGroupSchema = z.object({
    bio: z.string().max(2000, 'Bio must be 2000 characters or fewer').trim().optional(),
});

/** GET /api/groups/[id] - public group details */
export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    try {
        const group = await prisma.orgGroup.findUnique({
            where: { id },
            include: {
                school: true,
                teacher: { select: { id: true, username: true, rating: true } },
                members: {
                    orderBy: { user: { username: 'asc' } },
                    select: {
                        user: {
                            select: { id: true, username: true, rating: true, schoolId: true, isApproved: true },
                        },
                    },
                },
            },
        });
        if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(group);
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
}

/** PUT /api/groups/[id] - update bio (teacher of that group only) */
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const group = await prisma.orgGroup.findUnique({ where: { id } });
        if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (group.teacherId !== session.user.id) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        let body: unknown;
        try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

        const result = updateGroupSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }

        const updated = await prisma.orgGroup.update({
            where: { id },
            data: { bio: result.data.bio ?? null },
        });
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
