import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/** GET /api/groups?schoolId=xxx — list groups, optionally filtered by school */
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
