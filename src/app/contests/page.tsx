import { prisma } from '@/lib/db';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ContestsPage() {
    const session = await getServerSession(authOptions);
    const now = new Date();

    const upcomingContests = await prisma.contest.findMany({
        where: { startTime: { gt: now } },
        orderBy: { startTime: 'asc' }
    });

    const activeContests = await prisma.contest.findMany({
        where: {
            startTime: { lte: now },
            endTime: { gte: now }
        },
        orderBy: { endTime: 'asc' }
    });

    const pastContests = await prisma.contest.findMany({
        where: { endTime: { lt: now } },
        orderBy: { endTime: 'desc' },
        take: 10
    });

    const isAdmin = session?.user?.isAdmin || false;

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Contests</h1>
                {session?.user?.isAdmin && (
                    <Link href="/admin/contests/new" className="btn btn-primary">
                        Create Contest
                    </Link>
                )}
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2 text-green-600">Active Contests</h2>
                {activeContests.length === 0 ? <p className="text-muted-foreground">No active contests.</p> : (
                    <div className="grid gap-4">
                        {activeContests.map((c: any) => <ContestCard key={c.id} contest={c} active isAdmin={isAdmin} />)}
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Upcoming Contests</h2>
                {upcomingContests.length === 0 ? <p className="text-muted-foreground">No upcoming contests.</p> : (
                    <div className="grid gap-4">
                        {upcomingContests.map((c: any) => <ContestCard key={c.id} contest={c} isAdmin={isAdmin} />)}
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Past Contests</h2>
                {pastContests.length === 0 ? <p className="text-muted-foreground">No past contests.</p> : (
                    <div className="grid gap-4">
                        {pastContests.map((c: any) => <ContestCard key={c.id} contest={c} past isAdmin={isAdmin} />)}
                    </div>
                )}
            </section>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ContestCard({ contest, active, past, isAdmin }: { contest: any, active?: boolean, past?: boolean, isAdmin?: boolean }) {
    const formatTime = (d: Date) => d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
            <div>
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                    <Link href={`/contests/${contest.id}`}>{contest.title}</Link>
                </h3>
                <div className="text-sm text-muted-foreground mt-1">
                    {formatTime(contest.startTime)} - {formatTime(contest.endTime)}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {active && (
                    <Link href={`/contests/${contest.id}`} className="btn btn-primary">
                        Enter Contest
                    </Link>
                )}
                {isAdmin && (
                    <Link href={`/contests/${contest.id}`} className="btn btn-outline">
                        Manage
                    </Link>
                )}
                {!active && !isAdmin && (
                    <Link href={`/contests/${contest.id}`} className="btn btn-outline">
                        View Info
                    </Link>
                )}
                {past && (
                    <Link href={`/contests/${contest.id}/standings`} className="btn btn-outline">
                        Standings
                    </Link>
                )}
            </div>
        </div>
    )
}
