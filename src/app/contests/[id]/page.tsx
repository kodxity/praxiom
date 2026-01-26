import { prisma } from '@/lib/db';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { AddProblemForm } from './AddProblemForm';
import { RegisterButton } from './RegisterButton';
import { ProblemsList } from './ProblemsList';

export default async function ContestPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    const contest = await prisma.contest.findUnique({
        where: { id: params.id },
        include: {
            problems: true,
            registrations: { where: { userId: session?.user?.id } }
        }
    });

    if (!contest) notFound();

    const isRegistered = contest.registrations.length > 0;

    const now = new Date();
    const isActive = now >= contest.startTime && now <= contest.endTime;
    const isPast = now > contest.endTime;
    const isUpcoming = now < contest.startTime;

    // Fetch user's submissions if logged in
    const submissions = session ? await prisma.submission.findMany({
        where: {
            userId: session.user.id,
            contestId: contest.id
        }
    }) : [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{contest.title}</h1>
                    <p className="text-muted-foreground whitespace-pre-line">{contest.description}</p>
                    <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                        <div>Start: {contest.startTime.toLocaleString()}</div>
                        <div>End: {contest.endTime.toLocaleString()}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' :
                                    isPast ? 'bg-gray-100 text-gray-700' :
                                        'bg-blue-100 text-blue-700'
                                }`}>
                                {isActive ? '🟢 Active' : isPast ? '⚫ Ended' : '🔵 Upcoming'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                    {session && !isPast && (
                        <RegisterButton contestId={contest.id} isRegistered={isRegistered} />
                    )}

                    <Link href={`/contests/${contest.id}/standings`} className="btn btn-outline">
                        View Standings
                    </Link>
                </div>
            </div>

            {/* Problems Section */}
            {contest.problems.length > 0 ? (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Problems</h2>
                    {session && isRegistered && isActive ? (
                        <ProblemsList
                            problems={contest.problems}
                            contestId={contest.id}
                            initialSubmissions={submissions}
                        />
                    ) : (
                        <div className="space-y-4">
                            {contest.problems.map((problem, idx) => (
                                <div key={problem.id} className="card">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold">Problem {String.fromCharCode(65 + idx)}: {problem.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{problem.points} points</p>
                                        </div>
                                    </div>
                                    {!session && (
                                        <p className="text-sm text-muted-foreground mt-4">Please log in to view problem details.</p>
                                    )}
                                    {session && !isRegistered && (
                                        <p className="text-sm text-muted-foreground mt-4">Please register for this contest to view problems.</p>
                                    )}
                                    {session && isRegistered && !isActive && (
                                        <p className="text-sm text-muted-foreground mt-4">
                                            {isUpcoming ? 'Contest has not started yet.' : 'Contest has ended.'}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    No problems added yet.
                </div>
            )}

            {/* Admin Area */}
            {session?.user?.isAdmin && (
                <div className="border-t pt-8">
                    <h2 className="text-xl font-bold mb-4">Admin Area</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold mb-2">Problems ({contest.problems.length})</h3>
                            <div className="space-y-2">
                                {contest.problems.map((p, i) => (
                                    <div key={p.id} className="p-3 border rounded bg-muted/30">
                                        <div className="font-medium">#{i + 1} {p.title}</div>
                                        <div className="text-sm text-muted-foreground mt-1">Answer: {p.correctAnswer} | Points: {p.points}</div>
                                    </div>
                                ))}
                                {contest.problems.length === 0 && <div className="text-muted-foreground italic">No problems added yet.</div>}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Add Problem</h3>
                            <AddProblemForm contestId={contest.id} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
