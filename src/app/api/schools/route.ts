import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, rateLimitResponse, getIp } from '@/lib/rateLimit';

export async function GET(request: Request) {
    // 60 school searches per minute per IP
    const ip = getIp(request);
    if (!checkRateLimit(`schools:ip:${ip}`, { windowMs: 60_000, max: 60 })) {
        return rateLimitResponse();
    }
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() ?? '';
    const rawLimit = parseInt(searchParams.get('limit') ?? '20', 10);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : 20;

    if (!search || search.length > 100) return NextResponse.json([]);

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
