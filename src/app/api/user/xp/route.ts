import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true },
    });
    return NextResponse.json({ xp: user?.xp ?? 0 });
}
