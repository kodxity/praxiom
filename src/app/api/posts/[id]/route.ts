import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
        if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(post);
    } catch {
        return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
    }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    try {
        const post = await prisma.blogPost.update({
            where: { id: params.id },
            data: {
                title: body.title,
                content: body.content,
                isAnnouncement: body.isAnnouncement ?? true,
            },
        });
        return NextResponse.json(post);
    } catch {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        await prisma.comment.deleteMany({ where: { postId: params.id } });
        await prisma.vote.deleteMany({ where: { postId: params.id } });
        await prisma.blogPost.delete({ where: { id: params.id } });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
