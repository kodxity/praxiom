'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserSettings({ user }: { user: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(user.description || '');
    const router = useRouter();

    async function save() {
        await fetch('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify({ description }),
            headers: { 'Content-Type': 'application/json' }
        });
        setIsEditing(false);
        router.refresh();
    }

    if (!isEditing) {
        return (
            <button onClick={() => setIsEditing(true)} className="btn btn-outline btn-sm">
                Edit Profile
            </button>
        )
    }

    return (
        <div className="space-y-4 max-w-lg">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">Edit Description</h3>
            <textarea
                className="input w-full"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="Tell the community about yourself..."
            />
            <div className="flex gap-2">
                <button onClick={save} className="btn btn-primary btn-sm">Save Changes</button>
                <button
                    onClick={() => { setIsEditing(false); setDescription(user.description || ''); }}
                    className="btn btn-outline btn-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
