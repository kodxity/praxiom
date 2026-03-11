'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    username: string;
    isTeacher: boolean;
}

export function AdminUserControls({ user }: { user: User }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function setRole(isTeacher: boolean) {
        if (!confirm(`Are you sure you want to make this user a ${isTeacher ? 'Teacher' : 'Student'}?`)) return;
        
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                body: JSON.stringify({
                    userId: user.id,
                    action: isTeacher ? 'setTeacher' : 'setStudent'
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to update role');
            } else {
                router.refresh();
            }
        } catch (err) {
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '12px', 
            background: 'var(--rose-bg)', 
            padding: '14px 20px', 
            borderRadius: 'var(--r-lg)',
            border: '1px solid var(--rose-border)',
            marginBottom: '20px'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ 
                    fontFamily: 'var(--ff-mono)', 
                    fontSize: '10px', 
                    fontWeight: 600, 
                    color: 'var(--rose)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.12em', 
                    marginBottom: '2px' 
                }}>
                    Admin Controls
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink3)', fontWeight: 300 }}>
                    Override user role to <strong>{user.isTeacher ? 'Student' : 'Teacher'}</strong>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                    onClick={() => setRole(false)}
                    disabled={loading || !user.isTeacher}
                    className={`btn btn-xs ${!user.isTeacher ? 'btn-ink' : 'btn-outline'}`}
                    style={{ minWidth: '80px' }}
                >
                    Student
                </button>
                <button 
                    onClick={() => setRole(true)}
                    disabled={loading || user.isTeacher}
                    className={`btn btn-xs ${user.isTeacher ? 'btn-ink' : 'btn-outline'}`}
                    style={{ minWidth: '80px' }}
                >
                    Teacher
                </button>
            </div>
        </div>
    );
}
