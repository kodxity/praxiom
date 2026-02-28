import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { RatingGraph } from './RatingGraph';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserSettings } from './UserSettings';

export default async function UserProfile(props: { params: Promise<{ username: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({
        where: { username: params.username },
        include: { ratingHistory: { orderBy: { createdAt: 'asc' } } }
    });

    if (!user) notFound();

    const isOwnProfile = session?.user?.username === user.username;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = user.ratingHistory.map((h: any) => ({
        date: h.createdAt.toLocaleDateString(),
        rating: h.newRating,
        contestId: h.contestId
    }));

    if (data.length === 0 || (data.length > 0 && data[0].rating !== 1200)) {
        data.unshift({ date: 'Start', rating: 1200, contestId: 'init' });
    }

    return (
        <div className="space-y-8">
            <div className="card p-8 bg-gradient-to-br from-card to-muted/50">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 tracking-tight">{user.username}</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-mono text-primary font-bold">
                                {user.rating} Points
                            </span>
                            <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded">
                                Rank: {getRankName(user.rating)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">About</h3>
                    <p className="max-w-2xl whitespace-pre-wrap text-foreground/90 leading-relaxed">
                        {user.description || <span className="italic text-muted-foreground">No description provided.</span>}
                    </p>
                </div>

                {isOwnProfile && (
                    <div className="mt-8 border-t pt-6">
                        <UserSettings user={user} />
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 card p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        Rating History
                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded">Last 10 updates</span>
                    </h2>
                    <div className="h-[300px] w-full">
                        <RatingGraph data={data} />
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">Statistics</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Contests</span>
                            <span className="font-bold">{user.ratingHistory.length}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Max Rating</span>
                            <span className="font-bold">
                                {Math.max(1200, ...user.ratingHistory.map((r: any) => r.newRating))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getRankName(rating: number) {
    if (rating < 1200) return 'Newbie';
    if (rating < 1400) return 'Pupil';
    if (rating < 1600) return 'Specialist';
    if (rating < 1900) return 'Expert';
    if (rating < 2100) return 'Candidate Master';
    if (rating < 2400) return 'Master';
    return 'Grandmaster';
}
