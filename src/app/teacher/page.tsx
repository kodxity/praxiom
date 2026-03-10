import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TeacherDashboardClient } from './TeacherDashboardClient';
import { prisma } from '@/lib/db';

export default async function TeacherPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isTeacher && !session?.user?.isAdmin) {
        redirect('/');
    }

    const teacherId = session.user.id;

    const group = await prisma.orgGroup.findUnique({
        where: { teacherId },
        include: {
            school: true,
        },
    });

    if (!group) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 1.75rem' }}>
                <p style={{ color: 'var(--ink4)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>
                    No group found. Your account may still be pending approval.
                </p>
            </div>
        );
    }

    return <TeacherDashboardClient group={group} />;
}
