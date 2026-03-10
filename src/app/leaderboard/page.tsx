import { prisma } from '@/lib/db';
import { LeaderboardClient } from './LeaderboardClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Leaderboard',
    description:
        'See the top math competitors on Praxiom ranked by contest rating. Track individual standings and group averages.',
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
    let groups: any[] = [];
    try {
        [users, groups] = await Promise.all([
            prisma.user.findMany({
                where: { isApproved: true },
                orderBy: { rating: 'desc' },
                select: {
                    id: true,
                    username: true,
                    rating: true,
                    schoolId: true,
                    groupId: true,
                    school: { select: { shortName: true, district: true } },
                    group: { select: { id: true, name: true, school: { select: { shortName: true, district: true } } } },
                    _count: { select: { ratingHistory: true } },
                },
            }),
            prisma.orgGroup.findMany({
                include: {
                    school: { select: { shortName: true, district: true } },
                    teacher: { select: { username: true } },
                    members: {
                        select: { rating: true },
                    },
                },
            }),
        ]);
    } catch {
        // DB unavailable in local frontend dev
    }

    // Compute group stats - include groups with 0 members
    const groupsWithStats = groups
        .map((g: any) => ({
            id: g.id,
            name: g.name,
            school: g.school,
            teacher: g.teacher,
            memberCount: g.members.length,
            avgRating: g.members.length > 0
                ? Math.round(g.members.reduce((s: number, m: any) => s + m.rating, 0) / g.members.length)
                : null,
            topRating: g.members.length > 0
                ? Math.max(...g.members.map((m: any) => m.rating))
                : null,
        }))
        .sort((a: any, b: any) => (b.avgRating ?? 0) - (a.avgRating ?? 0));

    return <LeaderboardClient users={users} groups={groupsWithStats} />;
}

