import { prisma } from '@/lib/db';
import Link from 'next/link';
import { UserApproval } from './UserApproval';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        redirect('/');
    }

    const pendingUsers = await prisma.user.findMany({
        where: { isApproved: false },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="card p-6 space-y-4">
                    <h2 className="text-xl font-bold">Quick Actions</h2>
                    <div className="flex flex-col gap-2">
                        <Link href="/admin/posts/new" className="btn btn-outline justify-start">
                            Create New Announcement
                        </Link>
                        <Link href="/admin/contests/new" className="btn btn-outline justify-start">
                            Create New Contest
                        </Link>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        Pending User Approvals
                        {pendingUsers.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingUsers.length}</span>}
                    </h2>
                    {pendingUsers.length === 0 ? <p className="text-muted-foreground">No pending users.</p> : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {pendingUsers.map(user => (
                                <UserApproval key={user.id} user={user} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
