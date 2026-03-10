'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Send, ArrowLeft, CheckCheck } from 'lucide-react';

const NAV_H = 64;

type Message = {
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; username: string };
    reads: { userId: string; user: { username: string } }[];
};

export default function GroupChatClient({ groupId, groupName }: { groupId: string; groupName: string }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);
    const feedRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const hasLoadedRef = useRef(false);
    const prevMsgCountRef = useRef(0);

    function atBottom() {
        const el = feedRef.current;
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    }

    const fetchMessages = useCallback(async () => {
        const wasAtBottom = atBottom();
        const initial = !hasLoadedRef.current;
        try {
            const res = await fetch(`/api/groups/${groupId}/chat`);
            if (res.status === 403) { router.push(`/groups/${groupId}`); return; }
            if (!res.ok) return;
            const data = await res.json();
            const hasNew = data.length > prevMsgCountRef.current;
            prevMsgCountRef.current = data.length;
            setMessages(data);
            // Only auto-scroll on initial load, or if new messages arrived AND already at bottom
            if (initial || (hasNew && wasAtBottom)) {
                requestAnimationFrame(() => {
                    bottomRef.current?.scrollIntoView({ behavior: initial ? 'instant' : 'smooth' });
                });
            }
        } finally {
            setLoading(false);
            hasLoadedRef.current = true;
        }
    }, [groupId, router]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Poll every 4s for new messages
    useEffect(() => {
        pollRef.current = setInterval(fetchMessages, 4000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [fetchMessages]);

    async function send() {
        const text = input.trim();
        if (!text || sending) return;
        setSending(true);
        setInput('');
        try {
            const res = await fetch(`/api/groups/${groupId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text }),
            });
            if (res.ok) {
                const msg = await res.json();
                setMessages(prev => [...prev, msg]);
                requestAnimationFrame(() => {
                    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                });
            }
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }

    function formatTime(iso: string) {
        const d = new Date(iso);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const myId = session?.user?.id;

    // Group consecutive messages from same author
    type GroupedMsg = { author: Message['author']; msgs: Message[] };
    const grouped: GroupedMsg[] = [];
    for (const m of messages) {
        const prev = grouped[grouped.length - 1];
        if (prev && prev.author.id === m.author.id) {
            prev.msgs.push(m);
        } else {
            grouped.push({ author: m.author, msgs: [m] });
        }
    }

    if (!session) return null;

    function getHue(name: string) {
        let h = 0;
        for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
        return h;
    }

    return (
        <div style={{
            position: 'fixed', top: `${NAV_H}px`, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            background: 'var(--bg, #faf8f4)',
        }}>

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '0 24px', height: '58px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg, #faf8f4)',
                flexShrink: 0, width: '100%', boxSizing: 'border-box',
                zIndex: 1,
            }}>
                <Link
                    href={`/groups/${groupId}`}
                    style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.04)', border: '1px solid var(--border)',
                        color: 'var(--ink3)', textDecoration: 'none', flexShrink: 0,
                        transition: 'background 0.15s',
                    }}
                >
                    <ArrowLeft size={16} />
                </Link>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(107,148,120,0.22) 0%, rgba(107,148,120,0.08) 100%)',
                    border: '1.5px solid rgba(107,148,120,0.28)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--ff-mono)', fontSize: '14px', color: 'var(--sage)', fontWeight: 700,
                }}>
                    {groupName[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontFamily: 'var(--ff-ui)', fontWeight: 700, fontSize: '15px',
                        color: 'var(--ink)', lineHeight: 1.2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {groupName}
                    </div>
                    <div style={{
                        fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--sage)',
                        letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '1px',
                    }}>
                        Group Chat
                    </div>
                </div>
            </div>

            {/* Message feed */}
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                {/* Top fade */}
                <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '48px', background: 'linear-gradient(to bottom, var(--bg, #faf8f4) 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
                {/* Bottom fade */}
                <div aria-hidden style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '48px', background: 'linear-gradient(to top, var(--bg, #faf8f4) 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
            <div ref={feedRef} style={{ height: '100%', overflowY: 'auto' }}>
            <div style={{ maxWidth: '840px', margin: '0 auto', padding: '24px 20px 16px', display: 'flex', flexDirection: 'column', gap: '18px', boxSizing: 'border-box' }}>
                {loading && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '8px', marginTop: '60px',
                        color: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: '12px',
                    }}>
                        <span style={{
                            width: '14px', height: '14px', borderRadius: '50%',
                            border: '2px solid rgba(0,0,0,0.08)', borderTopColor: 'var(--sage)',
                            display: 'inline-block', animation: 'spin 0.7s linear infinite',
                        }} />
                        Loading…
                    </div>
                )}
                {!loading && messages.length === 0 && (
                    <div style={{ textAlign: 'center', margin: '80px auto 0', maxWidth: '280px' }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '50%',
                            background: 'rgba(107,148,120,0.08)', border: '1.5px solid rgba(107,148,120,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 14px',
                        }}>
                            <Send size={18} style={{ color: 'var(--sage)', opacity: 0.6 }} />
                        </div>
                        <div style={{ fontFamily: 'var(--ff-display)', fontSize: '17px', fontStyle: 'italic', color: 'var(--ink3)', marginBottom: '6px' }}>
                            No messages yet
                        </div>
                        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)' }}>
                            Say hi to your group!
                        </div>
                    </div>
                )}

                {grouped.map((grp, gi) => {
                    const isMine = grp.author.id === myId;
                    const lastMsg = grp.msgs[grp.msgs.length - 1];
                    const readers = lastMsg.reads.filter(r => r.userId !== grp.author.id);
                    const hue = getHue(grp.author.username);

                    return (
                        <div key={gi} style={{
                            display: 'flex',
                            flexDirection: isMine ? 'row-reverse' : 'row',
                            alignItems: 'flex-end',
                            gap: '8px',
                        }}>
                            {/* Colored initial avatar (others only) */}
                            {!isMine && (
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                    background: `hsl(${hue},38%,86%)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'var(--ff-mono)', fontSize: '11px', fontWeight: 700,
                                    color: `hsl(${hue},35%,32%)`,
                                }}>
                                    {grp.author.username[0].toUpperCase()}
                                </div>
                            )}

                            {/* Bubble column */}
                            <div style={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: isMine ? 'flex-end' : 'flex-start',
                                gap: '2px', maxWidth: 'min(72%, 480px)',
                            }}>
                                {/* Author name (others only) */}
                                {!isMine && (
                                    <span style={{
                                        fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 700,
                                        color: `hsl(${hue},40%,38%)`,
                                        paddingLeft: '6px', letterSpacing: '0.04em', marginBottom: '2px',
                                    }}>
                                        {grp.author.username}
                                    </span>
                                )}

                                {grp.msgs.map((m, mi) => {
                                    const n = grp.msgs.length;
                                    const br = isMine
                                        ? `${mi === 0 ? 18 : 6}px 18px ${mi === n - 1 ? 6 : 18}px ${mi === n - 1 ? 18 : 6}px`
                                        : `18px ${mi === 0 ? 18 : 6}px ${mi === n - 1 ? 18 : 6}px ${mi === n - 1 ? 6 : 18}px`;
                                    return (
                                        <div key={m.id} title={formatTime(m.createdAt)} style={{
                                            padding: '9px 14px',
                                            borderRadius: br,
                                            background: isMine ? 'var(--sage)' : 'white',
                                            border: isMine ? 'none' : '1px solid rgba(0,0,0,0.08)',
                                            boxShadow: isMine
                                                ? '0 2px 10px rgba(107,148,120,0.28)'
                                                : '0 1px 3px rgba(0,0,0,0.07)',
                                            color: isMine ? '#fff' : 'var(--ink)',
                                            fontFamily: 'var(--ff-body)', fontSize: '14px',
                                            lineHeight: 1.55,
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                        }}>
                                            {m.content}
                                        </div>
                                    );
                                })}

                                {/* Meta: timestamp + read receipt */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    paddingInline: '4px', marginTop: '3px',
                                    flexDirection: isMine ? 'row-reverse' : 'row',
                                }}>
                                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>
                                        {formatTime(lastMsg.createdAt)}
                                    </span>
                                    {readers.length > 0 && (
                                        <span
                                            title={`Read by: ${readers.map(r => r.user.username).join(', ')}`}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '3px',
                                                color: isMine ? 'var(--sage)' : 'var(--ink5)',
                                                fontFamily: 'var(--ff-mono)', fontSize: '10px',
                                            }}
                                        >
                                            <CheckCheck size={11} />
                                            {readers.length === 1 ? readers[0].user.username : `${readers.length}`}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>{/* inner padding wrapper */}
            </div>{/* feedRef scrollable */}
            </div>{/* fade wrapper */}

            {/* Input bar */}
            <div style={{
                borderTop: '1px solid var(--border)',
                background: 'var(--bg, #faf8f4)',
                flexShrink: 0, width: '100%', boxSizing: 'border-box',
                padding: '10px 0 16px',
            }}>
            <div style={{ maxWidth: '840px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Message the group…"
                    rows={1}
                    style={{
                        flex: 1, resize: 'none', overflowY: 'hidden',
                        padding: '10px 16px', borderRadius: '22px',
                        border: '1.5px solid var(--border)',
                        background: 'white',
                        fontFamily: 'var(--ff-body)', fontSize: '14px',
                        color: 'var(--ink)', outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                        lineHeight: 1.5, maxHeight: '120px',
                    }}
                    onFocus={e => {
                        e.target.style.borderColor = 'var(--sage)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(107,148,120,0.1)';
                    }}
                    onBlur={e => {
                        e.target.style.borderColor = 'var(--border)';
                        e.target.style.boxShadow = 'none';
                    }}
                    onInput={e => {
                        const el = e.currentTarget;
                        el.style.height = 'auto';
                        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                    }}
                />
                <button
                    onClick={send}
                    disabled={!input.trim() || sending}
                    style={{
                        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                        background: input.trim() && !sending ? 'var(--sage)' : 'rgba(0,0,0,0.07)',
                        border: 'none',
                        cursor: input.trim() && !sending ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: input.trim() && !sending ? 'white' : 'var(--ink5)',
                        transition: 'all 0.15s',
                        boxShadow: input.trim() && !sending ? '0 2px 8px rgba(107,148,120,0.35)' : 'none',
                    }}
                    aria-label="Send"
                >
                    <Send size={15} />
                </button>
            </div>{/* inner max-width wrapper */}
            </div>{/* input bar */}
        </div>
    );
}
