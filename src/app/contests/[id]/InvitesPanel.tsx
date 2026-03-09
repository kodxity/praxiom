'use client';
import { useState, useEffect, useCallback } from 'react';

const MONO = 'var(--ff-mono)';
const UI = 'var(--ff-ui)';

interface Invite {
    id: string;
    teamId: string;
    status: string;
    team: {
        id: string;
        name: string;
        maxSize: number;
        members: { user: { id: string; username: string } }[];
        leader: { id: string; username: string };
    };
    invitedByUser: { id: string; username: string };
}

interface Props {
    contestId: string;
    contestStarted: boolean;
    onTeamJoined?: () => void;
}

export function InvitesPanel({ contestId, contestStarted, onTeamJoined }: Props) {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const flash = (m: string, isErr = false) => {
        if (isErr) setErr(m); else setMsg(m);
        setTimeout(() => { setErr(''); setMsg(''); }, 4000);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/contests/${contestId}/my-invites`);
            if (res.ok) setInvites(await res.json());
        } finally {
            setLoading(false);
        }
    }, [contestId]);

    useEffect(() => { load(); }, [load]);

    async function respond(invite: Invite, action: 'accept' | 'decline') {
        setProcessing(invite.id);
        const res = await fetch(`/api/contests/${contestId}/teams/${invite.teamId}/invites/${invite.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }),
        });
        setProcessing(null);
        if (res.ok) {
            if (action === 'accept') {
                flash('Joined team!');
                onTeamJoined?.();
            } else {
                flash('Invite declined.');
            }
            await load();
        } else {
            const d = await res.json().catch(() => ({}));
            flash(d.error ?? 'Action failed.', true);
        }
    }

    if (loading) {
        return (
            <div style={{ padding: '32px', textAlign: 'center', fontFamily: MONO, fontSize: '11px', color: 'var(--ink5)' }}>
                Loading invites…
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {msg && <div style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--sage-bg)', border: '1px solid var(--sage-border)', fontFamily: MONO, fontSize: '12px', color: 'var(--sage)' }}>{msg}</div>}
            {err && <div style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(184,96,78,0.08)', border: '1px solid rgba(184,96,78,0.22)', fontFamily: MONO, fontSize: '12px', color: 'var(--rose)' }}>{err}</div>}

            {invites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', fontFamily: MONO, fontSize: '12px', color: 'var(--ink5)' }}>
                    No pending team invites.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {invites.map(inv => (
                        <div key={inv.id} className="g" style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: UI, fontWeight: 600, fontSize: '15px', color: 'var(--ink)', marginBottom: '4px' }}>
                                        {inv.team.name}
                                    </div>
                                    <div style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--ink5)', lineHeight: 1.6 }}>
                                        Invited by @{inv.invitedByUser.username} · Leader: @{inv.team.leader.username}
                                    </div>
                                    <div style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--ink5)', marginTop: '3px' }}>
                                        Members ({inv.team.members.length}/{inv.team.maxSize}): {inv.team.members.map(m => m.user.username).join(', ')}
                                    </div>
                                </div>
                                {!contestStarted && (
                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                                        <button
                                            onClick={() => respond(inv, 'accept')}
                                            disabled={processing === inv.id}
                                            className="btn btn-sage"
                                            style={{ fontSize: '12px' }}
                                        >
                                            {processing === inv.id ? '…' : 'Accept'}
                                        </button>
                                        <button
                                            onClick={() => respond(inv, 'decline')}
                                            disabled={processing === inv.id}
                                            style={{ fontFamily: MONO, fontSize: '12px', color: 'var(--ink4)', background: 'none', border: '1px solid var(--glass-border)', borderRadius: '7px', padding: '7px 14px', cursor: 'pointer' }}
                                        >
                                            Decline
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
