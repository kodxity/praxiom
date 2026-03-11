import { prisma } from '@/lib/db';
import { LeaderboardClient } from './LeaderboardClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Leaderboard',
    description: 'See the top math competitors on Praxiom ranked by contest rating.',
    openGraph: {
        title: 'Leaderboard | Praxiom',
        description: 'Top-rated math competitors ranked by contest performance.',
        url: '/leaderboard',
    },
    alternates: { canonical: '/leaderboard' },
};

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
    let users: any[] = [];
    try {
        users = await prisma.user.findMany({
            where: { isApproved: true },
            orderBy: { rating: 'desc' },
            select: {
                id: true,
                username: true,
                rating: true,
                isAdmin: true,
                isTeacher: true,
                schoolId: true,
                school: { select: { shortName: true, district: true } },
                groupMemberships: { select: { group: { select: { id: true, name: true, school: { select: { shortName: true, district: true } } } } } },
                _count: { select: { ratingHistory: true } },
            },
        });
    } catch {
        // DB unavailable in local frontend dev
    }

    return <LeaderboardClient users={users} />;
}
