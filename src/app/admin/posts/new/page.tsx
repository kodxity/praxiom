'use client';
import { useRouter } from 'next/navigation';

export default function NewPostPage() {
    const router = useRouter();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);

        const res = await fetch('/api/posts', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(form)),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            router.push('/');
            router.refresh();
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create Announcement</h1>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input name="title" placeholder="Title" required className="input text-lg font-bold" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Content</label>
                    <textarea name="content" placeholder="Content" required className="input min-h-[300px]" />
                </div>
                <button className="btn btn-primary">Publish</button>
            </form>
        </div>
    )
}
