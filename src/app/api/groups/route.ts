import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

/** GET /api/groups?schoolId=xxx - list groups, optionally filtered by school */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');

    try {
        const groups = await prisma.orgGroup.findMany({
            where: schoolId ? { schoolId } : undefined,
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                schoolId: true,
                school: { select: { name: true, shortName: true, district: true } },
                teacher: { select: { username: true } },
                _count: { select: { members: true } },
            },
        });
        return NextResponse.json(groups);
    } catch {
        return NextResponse.json([], { status: 200 });
    }
}

const createGroupSchema = z.object({
    name: z.string().min(2, 'Group name is required').max(80, 'Group name is too long'),
});

/** POST /api/groups - create a group (teacher only) */
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.isTeacher) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const result = createGroupSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    try {
        const userId = session.user.id;
        console.log('[DEBUG] Group creation attempt for user:', userId);
        const teacher = await prisma.user.findUnique({ 
            where: { id: userId }, 
            select: { id: true, isTeacher: true, schoolId: true } 
        });
        console.log('[DEBUG] Teacher record found:', teacher ? JSON.stringify(teacher) : 'NULL');

        if (!teacher) {
            return NextResponse.json({ error: 'User record not found' }, { status: 404 });
        }
        if (!teacher.isTeacher) {
            return NextResponse.json({ error: 'User is not marked as teacher in DB' }, { status: 403 });
        }


        const group = await prisma.orgGroup.create({
            data: {
                name: result.data.name.trim(),
                teacherId: userId,
                schoolId: teacher.schoolId,
            },
        });
        console.log('[DEBUG] Group created successfully with ID:', group.id);
        return NextResponse.json(group);
    } catch (e: any) {
        console.error('[DEBUG] Prisma Error in POST /api/groups:', e);
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
}
