'use client';
import { useRouter } from 'next/navigation';

export default function NewContestPage() {
    const router = useRouter();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);

        const res = await fetch('/api/contests', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(form)),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            router.push('/contests');
            router.refresh();
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create Contest</h1>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input name="title" required className="input" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" className="input" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Time</label>
                        <input name="startTime" type="datetime-local" required className="input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Time</label>
                        <input name="endTime" type="datetime-local" required className="input" />
                    </div>
                </div>
                <button className="btn btn-primary w-full">Create Contest</button>
            </form>
        </div>
    )
}
