'use client';

import { useState } from 'react';
import Link from 'next/link';

type Status = 'member' | 'teacher' | 'pending' | 'none' | 'login' | 'other_group';

export function JoinGroupButton({
    groupId,
    status,
    compact = false,
}: {
    groupId: string;
    status: Status;
    compact?: boolean;
}) {
    const [state, setState] = useState<Status>(status);
    const [loading, setLoading] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);

    async function requestJoin() {
        setLoading(true);
        const res = await fetch(`/api/groups/${groupId}/join`, { method: 'POST' });
        setLoading(false);
        if (res.ok) setState('pending');
    }

    if (state === 'login') {
        return (
            <Link
                href="/login"
                className={compact ? 'btn btn-ghost btn-sm' : 'btn btn-ghost'}
                style={compact ? { fontSize: '11px' } : undefined}
            >
                Log in to join
            </Link>
        );
    }

    if (state === 'teacher') {
        return (
            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: compact ? '10px' : '11px', color: 'var(--ink5)' }}>
                You teach this group
            </span>
        );
    }

    async function leaveGroup() {
        setLoading(true);
        const res = await fetch(`/api/groups/${groupId}/leave`, { method: 'DELETE' });
        setLoading(false);
        if (res.ok) setState('none');
        setConfirmLeave(false);
    }

    if (state === 'member') {
        if (confirmLeave) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: compact ? '10px' : '11px', color: 'var(--ink4)' }}>Leave group?</span>
                    <button
                        className={compact ? 'btn btn-ghost btn-sm' : 'btn btn-ghost'}
                        onClick={leaveGroup}
                        disabled={loading}
                        style={compact ? { fontSize: '10px', color: 'var(--red, #c0392b)' } : { color: 'var(--red, #c0392b)' }}
                    >
                        {loading ? '…' : 'Yes, leave'}
                    </button>
                    <button
                        className={compact ? 'btn btn-ghost btn-sm' : 'btn btn-ghost'}
                        onClick={() => setConfirmLeave(false)}
                        disabled={loading}
                        style={compact ? { fontSize: '10px' } : undefined}
                    >
                        Cancel
                    </button>
                </div>
            );
        }
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: compact ? '10px' : '11px', color: 'var(--sage)' }}>
                    Member
                </span>
                <button
                    className={compact ? 'btn btn-ghost btn-sm' : 'btn btn-ghost'}
                    onClick={() => setConfirmLeave(true)}
                    style={compact ? { fontSize: '10px', color: 'var(--ink5)' } : { color: 'var(--ink5)' }}
                >
                    Leave
                </button>
            </div>
        );
    }

    if (state === 'other_group') {
        return (
            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: compact ? '10px' : '11px', color: 'var(--ink5)' }}>
                Already in a group
            </span>
        );
    }

    async function cancelRequest() {
        setLoading(true);
        const res = await fetch(`/api/groups/${groupId}/join`, { method: 'DELETE' });
        setLoading(false);
        if (res.ok) setState('none');
    }

    if (state === 'pending') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: compact ? '10px' : '11px', color: 'var(--ink5)' }}>
                    Request sent
                </span>
                <button
                    className={compact ? 'btn btn-ghost btn-sm' : 'btn btn-ghost'}
                    onClick={cancelRequest}
                    disabled={loading}
                    style={compact ? { fontSize: '10px' } : undefined}
                >
                    {loading ? '…' : 'Cancel'}
                </button>
            </div>
        );
    }

    return (
        <button
            className={compact ? 'btn btn-sage btn-sm' : 'btn btn-sage'}
            onClick={requestJoin}
            disabled={loading}
            style={compact ? { fontSize: '11px' } : undefined}
        >
            {loading ? 'Requesting…' : 'Request to join'}
        </button>
    );
}
