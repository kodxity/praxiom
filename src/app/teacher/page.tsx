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

    redirect('/groups');
}
