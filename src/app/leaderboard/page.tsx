import { prisma } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
    const users = await prisma.user.findMany({
        where: { isApproved: true },
        orderBy: { rating: 'desc' },
        select: {
            id: true,
            username: true,
            rating: true,
            _count: {
                select: { ratingHistory: true } // Number of contests participated in
            }
        }
    });

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Global Leaderboard</h1>

            <div className="card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/50">
                        <tr className="border-b">
                            <th className="p-4 font-bold w-24">Rank</th>
                            <th className="p-4 font-bold">User</th>
                            <th className="p-4 font-bold text-right">Contests</th>
                            <th className="p-4 font-bold text-right">Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user: any, i: number) => (
                            <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                                <td className="p-4 text-muted-foreground font-medium">#{i + 1}</td>
                                <td className="p-4 font-medium">
                                    <Link href={`/user/${user.username}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                                        <span className={getRatingColor(user.rating)}>{user.username}</span>
                                    </Link>
                                </td>
                                <td className="p-4 text-muted-foreground text-right">{user._count.ratingHistory}</td>
                                <td className="p-4 font-bold text-right">{user.rating}</td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function getRatingColor(rating: number) {
    if (rating >= 2400) return "text-red-600 font-bold";
    if (rating >= 2100) return "text-orange-500 font-bold";
    if (rating >= 1900) return "text-purple-600 font-bold";
    if (rating >= 1600) return "text-blue-600 font-bold";
    if (rating >= 1400) return "text-cyan-600 font-bold";
    if (rating >= 1200) return "text-green-600 font-bold";
    return "text-gray-500 font-bold";
}
