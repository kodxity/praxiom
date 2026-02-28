'use client';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export function AddProblemForm({ contestId }: { contestId: string }) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const data = Object.fromEntries(form);

        try {
            const res = await fetch(`/api/contests/${contestId}/problems`, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                formRef.current?.reset();
                router.refresh();
                alert('Problem added successfully!');
            } else {
                const text = await res.text();
                console.error("Failed to add problem:", text);
                alert(`Failed to add problem: ${text || res.statusText}`);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while adding the problem.');
        }
    }

    return (
        <form ref={formRef} onSubmit={onSubmit} className="space-y-3 p-4 border rounded-lg bg-card">
            <input name="title" placeholder="Problem Title" required className="input" />
            <textarea name="statement" placeholder="Problem Statement" required className="input" rows={3} />
            <input name="correctAnswer" placeholder="Correct Answer" required className="input" />
            <div className="flex items-center gap-2">
                <input name="points" type="number" placeholder="Points" defaultValue={100} required className="input w-24" />
                <button className="btn btn-primary flex-1">Add Problem</button>
            </div>
        </form>
    )
}
