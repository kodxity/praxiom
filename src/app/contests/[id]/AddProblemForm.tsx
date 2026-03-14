'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

export function AddProblemForm({ contestId }: { contestId: string }) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [createdProblemId, setCreatedProblemId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus(null);
        setCreatedProblemId(null);
        setSubmitting(true);
        const form = new FormData(e.currentTarget);
        const data = Object.fromEntries(form);

        try {
            const res = await fetch(`/api/contests/${contestId}/problems`, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                const created = await res.json().catch(() => null) as { id?: string } | null;
                formRef.current?.reset();
                router.refresh();
                setStatus({ type: 'success', message: 'Problem added!' });
                if (created?.id) setCreatedProblemId(created.id);
            } else {
                let message = res.statusText;
                try {
                    const json = await res.json();
                    message = json.message ?? message;
                } catch { /* non-JSON body */ }
                setStatus({ type: 'error', message });
            }
        } catch {
            setStatus({ type: 'error', message: 'Network error — please try again.' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form ref={formRef} onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input name="title" placeholder="Problem Title" required className="input" />
            <textarea name="statement" placeholder="Problem Statement" required className="input" rows={4} style={{ resize: 'vertical' }} />
            <input name="correctAnswer" placeholder="Correct Answer" required className="input" />
            <textarea name="hint" placeholder="Hint (optional - costs half XP to reveal)" className="input" rows={2} style={{ resize: 'vertical' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input name="points" type="number" placeholder="Points" defaultValue={100} required className="input" style={{ width: '100px' }} />
                <button className="btn btn-sage" disabled={submitting} style={{ flex: 1, opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? 'Adding…' : 'Add Problem'}
                </button>
            </div>
            {status && (
                <div style={{
                    padding: '9px 13px',
                    borderRadius: 'var(--r)',
                    fontFamily: 'var(--ff-ui)',
                    fontSize: '13px',
                    background: status.type === 'success' ? 'var(--sage-bg)' : 'var(--rose-bg)',
                    border: `1px solid ${status.type === 'success' ? 'var(--sage-border)' : 'var(--rose-border)'}`,
                    color: status.type === 'success' ? 'var(--sage)' : 'var(--rose)',
                }}>
                    {status.message}
                </div>
            )}
            {createdProblemId && (
                <Link
                    href={`/admin/contests/${contestId}/problems/${createdProblemId}/edit`}
                    className="btn btn-ghost btn-sm"
                    style={{ alignSelf: 'flex-start' }}
                >
                    Edit this problem â†’
                </Link>
            )}
        </form>
    );
}
