import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ArenaClient } from './ArenaClient';
import Link from 'next/link';

export default async function ArenaPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect(`/login?callbackUrl=/contests/${params.id}/arena`);
    }

    const contest = await prisma.contest.findUnique({
        where: { id: params.id },
        include: {
            problems: {
                select: { id: true, title: true, statement: true, points: true }
            },
            registrations: { where: { userId: session.user.id } }
        }
    });

    if (!contest) notFound();

    // Check if user is registered
    if (contest.registrations.length === 0 && !session.user.isAdmin) {
        redirect(`/contests/${contest.id}`);
    }

    const now = new Date();
    if (now < contest.startTime || now > contest.endTime) {
        // Allow admin to preview
        if (!session.user.isAdmin) {
            redirect(`/contests/${contest.id}`);
        }
    }

    // Fetch user's previous submissions to show status
    const submissions = await prisma.submission.findMany({
        where: {
            userId: session.user.id,
            contestId: contest.id
        }
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
                <h1 className="text-2xl font-bold">{contest.title} - Arena</h1>
                <Link href={`/contests/${contest.id}/standings`} className="btn btn-outline" target="_blank">
                    View Standings
                </Link>
            </div>
            <ArenaClient contest={contest} initialSubmissions={submissions} />
        </div>
    );
}
