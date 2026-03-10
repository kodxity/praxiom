import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/** POST /api/groups/[id]/join - request to join a group */
export async function POST(_req: Request, props: { params: Promise<{ id: string }> }) {
    const { id: groupId } = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const group = await prisma.orgGroup.findUnique({ where: { id: groupId } });
        if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        if (user.isTeacher || user.isAdmin) {
            return NextResponse.json({ error: 'Teachers cannot join groups' }, { status: 403 });
        }

        await prisma.groupJoinRequest.upsert({
            where: { groupId_userId: { groupId, userId: user.id } },
            create: { groupId, userId: user.id },
            update: { status: 'PENDING' },
        });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

/** DELETE /api/groups/[id]/join - cancel join request */
export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
    const { id: groupId } = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    try {
        await prisma.groupJoinRequest.deleteMany({
            where: { groupId, userId: session.user.id },
        });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
