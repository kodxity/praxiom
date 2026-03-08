import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updatePostSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters').trim().optional(),
    content: z.string().min(1, 'Content is required').max(100000, 'Content cannot exceed 100,000 characters').optional(),
    isAnnouncement: z.boolean().optional(),
});

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
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const result = updatePostSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    try {
        const post = await prisma.blogPost.update({
            where: { id: params.id },
            data: {
                ...(result.data.title !== undefined && { title: result.data.title }),
                ...(result.data.content !== undefined && { content: result.data.content }),
                ...(result.data.isAnnouncement !== undefined && { isAnnouncement: result.data.isAnnouncement }),
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
