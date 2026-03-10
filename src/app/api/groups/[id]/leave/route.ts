import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/** DELETE /api/groups/[id]/leave - leave a group */
export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
    const { id: groupId } = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    try {
        await prisma.groupMember.deleteMany({
            where: { groupId, userId: session.user.id },
        });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
