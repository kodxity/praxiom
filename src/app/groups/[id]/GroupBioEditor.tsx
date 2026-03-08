'use client';
import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

export function GroupBioEditor({
    groupId,
    initialBio,
    isTeacher,
}: {
    groupId: string;
    initialBio: string | null;
    isTeacher: boolean;
}) {
    const [bio, setBio] = useState(initialBio ?? '');
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(bio);
    const [saving, setSaving] = useState(false);

    async function save() {
        setSaving(true);
        await fetch(`/api/groups/${groupId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bio: draft || null }),
        });
        setBio(draft);
        setEditing(false);
        setSaving(false);
    }

    if (editing) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    className="input"
                    rows={4}
                    placeholder="Write something about your group…"
                    style={{ resize: 'vertical', fontSize: '14px' }}
                    autoFocus
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="btn btn-sage btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: saving ? 0.7 : 1 }}
                    >
                        <Check size={13} />
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                        onClick={() => { setDraft(bio); setEditing(false); }}
                        className="btn btn-ghost btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <X size={13} />
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {bio ? (
                <p style={{ fontSize: '14px', color: 'var(--ink3)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{bio}</p>
            ) : (
                <p style={{ fontSize: '13px', color: 'var(--ink5)', fontStyle: 'italic', fontFamily: 'var(--ff-mono)' }}>
                    {isTeacher ? 'No bio yet — click Edit to add one.' : 'No bio yet.'}
                </p>
            )}
            {isTeacher && (
                <button
                    onClick={() => { setDraft(bio); setEditing(true); }}
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}
                >
                    <Pencil size={12} />
                    Edit bio
                </button>
            )}
        </div>
    );
}
