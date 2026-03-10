'use client';
import { useState, useEffect, useCallback } from 'react';

const MONO = 'var(--ff-mono)';
const UI = 'var(--ff-ui)';

interface Member {
    id: string;
    teamId: string;
    userId: string;
    role: string;
    relayOrder: number | null;
    joinedAt: string;
    user: { id: string; username: string; displayName: string | null };
}

interface Invite {
    id: string;
    invitedUser: { id: string; username: string; displayName: string | null };
    invitedByUser: { id: string; username: string; displayName: string | null };
    status: string;
}

interface JoinRequest {
    id: string;
    user: { id: string; username: string; displayName: string | null };
    status: string;
}

interface Team {
    id: string;
    name: string;
    leaderUserId: string;
    maxSize: number;
    status: string;
    members: Member[];
    invites: Invite[];
    joinRequests: JoinRequest[];
    leader: { id: string; username: string; displayName: string | null };
}

interface AllTeam {
    id: string;
    name: string;
    leaderUserId: string;
    maxSize: number;
    members: Member[];
    leader: { id: string; username: string; displayName: string | null };
}

interface Props {
    contestId: string;
    contestType: 'team' | 'relay';
    currentUserId: string;
    contestStarted: boolean;
    contestEnded: boolean;
}

export function TeamPanel({ contestId, contestType, currentUserId, contestStarted, contestEnded }: Props) {
    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [allTeams, setAllTeams] = useState<AllTeam[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [inviteUsername, setInviteUsername] = useState('');
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const [sendingInvite, setSendingInvite] = useState(false);
    const [transferTarget, setTransferTarget] = useState('');
    const [relayAssignments, setRelayAssignments] = useState<Record<string, number>>({});
    const [savingOrder, setSavingOrder] = useState(false);
    const [kickingId, setKickingId] = useState<string | null>(null);
    const [processingRequest, setProcessingRequest] = useState<string | null>(null);
    const [requestingTeamId, setRequestingTeamId] = useState<string | null>(null);

    const flash = (m: string, isErr = false) => {
        if (isErr) setErr(m); else setMsg(m);
        setTimeout(() => { setErr(''); setMsg(''); }, 4000);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [teamsRes] = await Promise.all([
                fetch(`/api/contests/${contestId}/teams`),
            ]);
            const teams: AllTeam[] = teamsRes.ok ? await teamsRes.json() : [];
            setAllTeams(teams);

            // Find my team
            const mine = teams.find(t => t.members.some(m => m.userId === currentUserId));
            if (mine) {
                // Fetch full team data
                const fullRes = await fetch(`/api/contests/${contestId}/teams/${mine.id}`);
                if (fullRes.ok) setMyTeam(await fullRes.json());
            } else {
                setMyTeam(null);
            }
        } finally {
            setLoading(false);
        }
    }, [contestId, currentUserId]);

    useEffect(() => { load(); }, [load]);

    // Pre-fill relay assignments from current member data
    useEffect(() => {
        if (myTeam && contestType === 'relay') {
            const init: Record<string, number> = {};
            myTeam.members.forEach(m => { if (m.relayOrder) init[m.userId] = m.relayOrder; });
            setRelayAssignments(init);
        }
    }, [myTeam, contestType]);

    async function createTeam() {
        if (!newTeamName.trim()) return;
        setCreating(true);
        const res = await fetch(`/api/contests/${contestId}/teams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newTeamName.trim() }),
        });
        setCreating(false);
        if (res.ok) {
            setNewTeamName('');
            flash('Team created!');
            await load();
        } else {
            const d = await res.json().catch(() => ({}));
            flash(d.error ?? 'Failed to create team.', true);
        }
    }

    async function sendInvite() {
        if (!myTeam || !inviteUsername.trim()) return;
        setSendingInvite(true);
        const res = await fetch(`/api/contests/${contestId}/teams/${myTeam.id}/invites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: inviteUsername.trim() }),
        });
        setSendingInvite(false);
        if (res.ok) {
            setInviteUsername('');
            flash('Invite sent!');
            await load();
        } else {
            const d = await res.json().catch(() => ({}));
            flash(d.error ?? 'Failed to send invite.', true);
        }
    }

    async function revokeInvite(inviteId: string) {
        if (!myTeam) return;
        await fetch(`/api/contests/${contestId}/teams/${myTeam.id}/invites/${inviteId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'revoke' }),
        });
        await load();
    }

    async function handleJoinRequest(reqId: string, action: 'accept' | 'reject') {
        if (!myTeam) return;
        setProcessingRequest(reqId);
        await fetch(`/api/contests/${contestId}/teams/${myTeam.id}/join-requests/${reqId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }),
        });
        setProcessingRequest(null);
        await load();
    }

    async function kickMember(memberId: string) {
        if (!myTeam) return;
        setKickingId(memberId);
        await fetch(`/api/contests/${contestId}/teams/${myTeam.id}/members/${memberId}`, { method: 'DELETE' });
        setKickingId(null);
        await load();
    }

    async function transferLeadership() {
        if (!myTeam || !transferTarget) return;
        const res = await fetch(`/api/contests/${contestId}/teams/${myTeam.id}/transfer-leadership`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newLeaderUserId: transferTarget }),
        });
        if (res.ok) { flash('Leadership transferred.'); await load(); }
        else { const d = await res.json().catch(() => ({})); flash(d.error ?? 'Failed.', true); }
    }

    async function saveRelayOrder() {
        if (!myTeam) return;
        const assignments = Object.entries(relayAssignments).map(([userId, slot]) => ({ userId, slot }));
        if (assignments.length !== 3) { flash('Assign all 3 slots first.', true); return; }
        setSavingOrder(true);
        const res = await fetch(`/api/contests/${contestId}/teams/${myTeam.id}/relay-order`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignments }),
        });
        setSavingOrder(false);
        if (res.ok) { flash('Relay order saved!'); await load(); }
        else { const d = await res.json().catch(() => ({})); flash(d.error ?? 'Failed to save order.', true); }
    }

    async function requestJoin(teamId: string) {
        setRequestingTeamId(teamId);
        const res = await fetch(`/api/contests/${contestId}/teams/${teamId}/join-requests`, { method: 'POST' });
        setRequestingTeamId(null);
        if (res.ok) { flash('Join request sent!'); await load(); }
        else { const d = await res.json().catch(() => ({})); flash(d.error ?? 'Failed to send request.', true); }
    }

    const isLeader = myTeam?.leaderUserId === currentUserId;
    const amMember = !!myTeam;
    const maxSize = contestType === 'relay' ? 3 : 6;

    const relayReady = contestType === 'relay' && myTeam && myTeam.members.length === 3 &&
        myTeam.members.every(m => m.relayOrder !== null);

    if (loading) {
        return (
            <div style={{ padding: '32px', textAlign: 'center', fontFamily: MONO, fontSize: '11px', color: 'var(--ink5)' }}>
                Loading team data…
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Flash messages */}
            {msg && <div style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--sage-bg)', border: '1px solid var(--sage-border)', fontFamily: MONO, fontSize: '12px', color: 'var(--sage)' }}>{msg}</div>}
            {err && <div style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(184,96,78,0.08)', border: '1px solid rgba(184,96,78,0.22)', fontFamily: MONO, fontSize: '12px', color: 'var(--rose)' }}>{err}</div>}

            {/* Contest started: show frozen notice */}
            {contestStarted && !contestEnded && (
                <div style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.04)', border: '1px solid var(--glass-border)', fontFamily: MONO, fontSize: '11px', color: 'var(--ink5)' }}>
                    Team registration is closed — contest has started.
                </div>
            )}

            {amMember && myTeam ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Team header */}
                    <div className="g" style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <h3 style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '20px', color: 'var(--ink)', margin: 0 }}>
                                {myTeam.name}
                            </h3>
                            <span style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ink5)', background: 'rgba(0,0,0,0.04)', borderRadius: '4px', padding: '2px 8px', textTransform: 'uppercase' }}>
                                {myTeam.members.length}/{myTeam.maxSize} members
                            </span>
                            {isLeader && (
                                <span style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.1em', color: 'var(--sage)', background: 'var(--sage-bg)', border: '1px solid var(--sage-border)', borderRadius: '4px', padding: '2px 8px' }}>
                                    LEADER
                                </span>
                            )}
                            {contestType === 'relay' && (
                                <span style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.1em', color: relayReady ? 'var(--sage)' : 'var(--rose)', background: relayReady ? 'var(--sage-bg)' : 'rgba(184,96,78,0.08)', border: `1px solid ${relayReady ? 'var(--sage-border)' : 'rgba(184,96,78,0.22)'}`, borderRadius: '4px', padding: '2px 8px' }}>
                                    {relayReady ? 'RELAY READY' : 'RELAY INCOMPLETE'}
                                </span>
                            )}
                        </div>

                        {/* Members list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {myTeam.members.map(m => (
                                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.025)', border: '1px solid var(--glass-border)' }}>
                                    {contestType === 'relay' && (
                                        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: '13px', color: 'var(--sage)', width: '22px', textAlign: 'center' }}>
                                            {m.relayOrder ?? '?'}
                                        </span>
                                    )}
                                    <span style={{ fontFamily: UI, fontSize: '14px', fontWeight: 500, color: 'var(--ink)', flex: 1 }}>
                                        {m.user.displayName ?? m.user.username}
                                        {m.userId === myTeam.leaderUserId && (
                                            <span style={{ fontFamily: MONO, fontSize: '9px', color: 'var(--sage)', marginLeft: '6px' }}>LEADER</span>
                                        )}
                                    </span>
                                    <span style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--ink5)' }}>@{m.user.username}</span>
                                    {/* Relay order picker (leader only, before start) */}
                                    {contestType === 'relay' && isLeader && !contestStarted && (
                                        <select
                                            value={relayAssignments[m.userId] ?? ''}
                                            onChange={e => {
                                                const slot = parseInt(e.target.value);
                                                if (!slot) { const c = { ...relayAssignments }; delete c[m.userId]; setRelayAssignments(c); return; }
                                                // Remove other member from this slot
                                                const cleared = Object.fromEntries(Object.entries(relayAssignments).filter(([uid, s]) => uid !== m.userId && s !== slot));
                                                setRelayAssignments({ ...cleared, [m.userId]: slot });
                                            }}
                                            style={{ fontFamily: MONO, fontSize: '11px', padding: '3px 6px', borderRadius: '5px', border: '1px solid var(--glass-border)', background: 'var(--bg)', color: 'var(--ink)' }}
                                        >
                                            <option value="">—</option>
                                            <option value="1">Slot 1</option>
                                            <option value="2">Slot 2</option>
                                            <option value="3">Slot 3</option>
                                        </select>
                                    )}
                                    {/* Kick button (leader only, before start, not self) */}
                                    {isLeader && !contestStarted && m.userId !== currentUserId && (
                                        <button
                                            onClick={() => kickMember(m.id)}
                                            disabled={kickingId === m.id}
                                            style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--rose)', background: 'rgba(184,96,78,0.08)', border: '1px solid rgba(184,96,78,0.18)', borderRadius: '5px', padding: '3px 8px', cursor: 'pointer' }}
                                        >
                                            {kickingId === m.id ? '…' : 'Kick'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Save relay order button */}
                        {contestType === 'relay' && isLeader && !contestStarted && myTeam.members.length === 3 && (
                            <div style={{ marginTop: '12px' }}>
                                <button onClick={saveRelayOrder} disabled={savingOrder} className="btn btn-sage" style={{ fontSize: '12px' }}>
                                    {savingOrder ? 'Saving…' : 'Save Relay Order'}
                                </button>
                            </div>
                        )}

                        {/* Relay incomplete warning */}
                        {contestType === 'relay' && myTeam.members.length < 3 && (
                            <p style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--rose)', marginTop: '12px', lineHeight: 1.5 }}>
                                ⚠ Your relay team needs {3 - myTeam.members.length} more member{3 - myTeam.members.length !== 1 ? 's' : ''} to be competition-ready.
                            </p>
                        )}
                    </div>

                    {/* Invite section (leader, before start) */}
                    {isLeader && !contestStarted && myTeam.members.length < maxSize && (
                        <div className="g" style={{ padding: '20px 24px' }}>
                            <h4 style={{ fontFamily: UI, fontWeight: 600, fontSize: '13px', color: 'var(--ink)', marginBottom: '12px' }}>Invite a Player</h4>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    value={inviteUsername}
                                    onChange={e => setInviteUsername(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendInvite()}
                                    placeholder="Username…"
                                    className="input"
                                    style={{ flex: 1, fontFamily: UI, fontSize: '13px' }}
                                />
                                <button onClick={sendInvite} disabled={sendingInvite} className="btn btn-sage" style={{ fontSize: '12px' }}>
                                    {sendingInvite ? '…' : 'Invite'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Pending outgoing invites (leader) */}
                    {isLeader && myTeam.invites.length > 0 && (
                        <div className="g" style={{ padding: '20px 24px' }}>
                            <h4 style={{ fontFamily: UI, fontWeight: 600, fontSize: '13px', color: 'var(--ink)', marginBottom: '12px' }}>Pending Invites</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {myTeam.invites.filter(i => i.status === 'PENDING').map(inv => (
                                    <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.025)' }}>
                                        <span style={{ fontFamily: UI, fontSize: '13px', color: 'var(--ink)', flex: 1 }}>
                                            @{inv.invitedUser.username}
                                        </span>
                                        {!contestStarted && (
                                            <button onClick={() => revokeInvite(inv.id)} style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink5)', background: 'none', border: '1px solid var(--glass-border)', borderRadius: '5px', padding: '3px 8px', cursor: 'pointer' }}>
                                                Revoke
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pending join requests (leader) */}
                    {isLeader && myTeam.joinRequests.length > 0 && !contestStarted && (
                        <div className="g" style={{ padding: '20px 24px' }}>
                            <h4 style={{ fontFamily: UI, fontWeight: 600, fontSize: '13px', color: 'var(--ink)', marginBottom: '12px' }}>Join Requests</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {myTeam.joinRequests.filter(r => r.status === 'PENDING').map(req => (
                                    <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.025)' }}>
                                        <span style={{ fontFamily: UI, fontSize: '13px', color: 'var(--ink)', flex: 1 }}>
                                            @{req.user.username}
                                        </span>
                                        <button onClick={() => handleJoinRequest(req.id, 'accept')} disabled={processingRequest === req.id} className="btn btn-sage" style={{ fontSize: '11px', padding: '4px 10px' }}>
                                            Accept
                                        </button>
                                        <button onClick={() => handleJoinRequest(req.id, 'reject')} disabled={processingRequest === req.id} style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--rose)', background: 'rgba(184,96,78,0.08)', border: '1px solid rgba(184,96,78,0.18)', borderRadius: '5px', padding: '4px 10px', cursor: 'pointer' }}>
                                            Reject
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Transfer leadership (leader, before start, 2+ members) */}
                    {isLeader && !contestStarted && myTeam.members.length > 1 && (
                        <div className="g" style={{ padding: '20px 24px' }}>
                            <h4 style={{ fontFamily: UI, fontWeight: 600, fontSize: '13px', color: 'var(--ink)', marginBottom: '12px' }}>Transfer Leadership</h4>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <select
                                    value={transferTarget}
                                    onChange={e => setTransferTarget(e.target.value)}
                                    style={{ fontFamily: UI, fontSize: '13px', padding: '6px 10px', borderRadius: '7px', border: '1px solid var(--glass-border)', background: 'var(--bg)', color: 'var(--ink)', flex: 1 }}
                                >
                                    <option value="">Select member…</option>
                                    {myTeam.members.filter(m => m.userId !== currentUserId).map(m => (
                                        <option key={m.userId} value={m.userId}>@{m.user.username}</option>
                                    ))}
                                </select>
                                <button onClick={transferLeadership} disabled={!transferTarget} className="btn btn-ghost" style={{ fontSize: '12px' }}>
                                    Transfer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* No team: show create form + browse */}
                    {!contestStarted && (
                        <div className="g" style={{ padding: '20px 24px' }}>
                            <h4 style={{ fontFamily: UI, fontWeight: 600, fontSize: '13px', color: 'var(--ink)', marginBottom: '12px' }}>
                                Create a {contestType === 'relay' ? 'Relay' : ''} Team
                            </h4>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    value={newTeamName}
                                    onChange={e => setNewTeamName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && createTeam()}
                                    placeholder="Team name…"
                                    className="input"
                                    style={{ flex: 1, fontFamily: UI, fontSize: '13px' }}
                                    maxLength={60}
                                />
                                <button onClick={createTeam} disabled={creating || !newTeamName.trim()} className="btn btn-sage" style={{ fontSize: '12px' }}>
                                    {creating ? '…' : 'Create'}
                                </button>
                            </div>
                            {contestType === 'relay' && (
                                <p style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink5)', marginTop: '8px', lineHeight: 1.5 }}>
                                    Relay teams need exactly 3 members. You will assign slots after teammates join.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Browse teams */}
                    {allTeams.length > 0 && (
                        <div className="g" style={{ padding: '20px 24px' }}>
                            <h4 style={{ fontFamily: UI, fontWeight: 600, fontSize: '13px', color: 'var(--ink)', marginBottom: '12px' }}>
                                {contestStarted ? 'Teams' : 'Open Teams'}
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {allTeams.map(t => {
                                    const isFull = t.members.length >= t.maxSize;
                                    const spots = t.maxSize - t.members.length;
                                    return (
                                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(0,0,0,0.025)', border: '1px solid var(--glass-border)' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontFamily: UI, fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '3px' }}>{t.name}</div>
                                                <div style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--ink5)' }}>
                                                    {t.members.length}/{t.maxSize} · Leader: @{t.leader.username} · {isFull ? 'Full' : `${spots} spot${spots !== 1 ? 's' : ''} open`}
                                                </div>
                                                <div style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink5)', marginTop: '4px' }}>
                                                    {t.members.map(m => m.user.username).join(', ')}
                                                </div>
                                            </div>
                                            {!contestStarted && !isFull && (
                                                <button
                                                    onClick={() => requestJoin(t.id)}
                                                    disabled={requestingTeamId === t.id}
                                                    className="btn btn-ghost"
                                                    style={{ fontSize: '11px' }}
                                                >
                                                    {requestingTeamId === t.id ? '…' : 'Request to Join'}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {allTeams.length === 0 && contestStarted && (
                        <div style={{ textAlign: 'center', padding: '40px', fontFamily: MONO, fontSize: '12px', color: 'var(--ink5)' }}>
                            No teams formed for this contest.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
