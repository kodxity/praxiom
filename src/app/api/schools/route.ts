import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() ?? '';
    const limit  = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);

    if (!search) return NextResponse.json([]);

    try {
        const schools = await prisma.school.findMany({
            where: {
                OR: [
                    { name:      { contains: search, mode: 'insensitive' } },
                    { shortName: { contains: search, mode: 'insensitive' } },
                    { district:  { contains: search, mode: 'insensitive' } },
                ],
            },
            orderBy: [{ district: 'asc' }, { name: 'asc' }],
            take: limit,
        });
        return NextResponse.json(schools);
    } catch {
        return NextResponse.json([]);
    }
}
