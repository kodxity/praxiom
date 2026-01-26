'use client';
import { useRouter } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserApproval({ user }: { user: any }) {
    const router = useRouter();
    async function approve() {
        await fetch('/api/admin/users', {
            method: 'PUT',
            body: JSON.stringify({ userId: user.id, action: 'approve' }),
            headers: { 'Content-Type': 'application/json' }
        });
        router.refresh();
    }

    return (
        <div className="flex items-center justify-between p-4 border rounded bg-background shadow-sm">
            <div>
                <div className="font-bold flex items-center gap-2">
                    {user.username}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                {user.description && <div className="text-sm mt-2 p-2 bg-muted/50 rounded">{user.description}</div>}
            </div>
            <button onClick={approve} className="btn btn-primary btn-sm px-4">Approve</button>
        </div>
    )
}
