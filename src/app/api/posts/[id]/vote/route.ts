import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

type Ctx = { params: Promise<{ id: string }> };

async function counts(postId: string, userId?: string) {
    const [upvotes, downvotes, userVote] = await Promise.all([
        prisma.vote.count({ where: { postId, type: 'UP' } }),
        prisma.vote.count({ where: { postId, type: 'DOWN' } }),
        userId ? prisma.vote.findUnique({ where: { userId_postId: { userId, postId } } }) : null,
    ]);
    return { upvotes, downvotes, userVote: userVote?.type ?? null };
}

export async function GET(_req: Request, ctx: Ctx) {
    const { id } = await ctx.params;
    const session = await getServerSession(authOptions);
    return NextResponse.json(await counts(id, session?.user?.id));
}

export async function POST(req: Request, ctx: Ctx) {
    const { id: postId } = await ctx.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    // 30 votes per minute per user
    if (!checkRateLimit(`vote:user:${session.user.id}`, { windowMs: 60_000, max: 30 })) {
        return rateLimitResponse();
    }

    let body: unknown;
    try { body = await req.json(); } catch { return new NextResponse('Invalid JSON', { status: 400 }); }
    const { type } = body as { type?: unknown };
    if (type !== 'UP' && type !== 'DOWN') {
        return new NextResponse('Invalid vote type', { status: 400 });
    }
    const userId = session.user.id;

    const existing = await prisma.vote.findUnique({
        where: { userId_postId: { userId, postId } },
    });

    if (existing) {
        if (existing.type === type) {
            // Same vote → remove (toggle off)
            await prisma.vote.delete({ where: { id: existing.id } });
        } else {
            // Different vote → switch
            await prisma.vote.update({ where: { id: existing.id }, data: { type } });
        }
    } else {
        await prisma.vote.create({ data: { userId, postId, type } });
    }

    return NextResponse.json(await counts(postId, userId));
}
