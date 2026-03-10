import { prisma } from '@/lib/db';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookOpen, Lock } from 'lucide-react';
import { MarkdownContent } from '@/components/MarkdownContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Resources',
    description: 'Math resources, guides, and study materials from teachers and admins.',
    openGraph: {
        title: 'Resources | Praxiom',
        description: 'Browse resources shared by teachers and administrators.',
        url: '/resources',
    },
    alternates: { canonical: '/resources' },
};

export const dynamic = 'force-dynamic';

export default async function ResourcesPage() {
    const session = await getServerSession(authOptions);

    let userSchoolId: string | null = null;
    if (session?.user?.id) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { schoolId: true },
            });
            userSchoolId = user?.schoolId ?? null;
        } catch { /* DB unavailable */ }
    }

    let resources: any[] = [];
    try {
        resources = await prisma.resource.findMany({
            where: {
                OR: [
                    { visibility: 'PUBLIC' },
                    ...(userSchoolId ? [{ visibility: 'SCHOOL_ONLY', schoolId: userSchoolId }] : []),
                ],
            },
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { username: true, isAdmin: true, isTeacher: true } },
                school: { select: { name: true, shortName: true } },
            },
        });
    } catch { /* DB unavailable */ }

    const canCreate = session?.user?.isAdmin || session?.user?.isTeacher;

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 1.75rem 80px', position: 'relative', zIndex: 1 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '10px' }}>LIBRARY</p>
                    <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.1 }}>
                        Resources
                    </h1>
                    <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--ink4)', marginTop: '8px' }}>
                        Guides, write-ups, and study materials from teachers and admins.
                    </p>
                </div>
                {canCreate && (
                    <Link href="/resources/new" className="btn btn-sage">
                        + New Resource
                    </Link>
                )}
            </div>

            {/* Resource grid */}
            {resources.length === 0 ? (
                <div className="g" style={{ overflow: 'hidden' }}>
                    <div className="empty">
                        <div style={{ width: '100px', height: '70px', border: '2px dashed rgba(184,96,78,.25)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                            <BookOpen style={{ width: '28px', height: '28px', opacity: 0.25, color: 'var(--rose)' }} />
                        </div>
                        <div className="empty-title">No resources yet</div>
                        <div className="empty-body">
                            {canCreate ? 'Add the first resource for your students.' : 'Check back later for resources from your teachers.'}
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {resources.map((resource: any, i: number) => {
                        const date = new Date(resource.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        const stripped = resource.content
                            .replace(/^#{1,6}\s+/gm, '')
                            .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
                            .replace(/_([^_]+)_/g, '$1')
                            .replace(/`[^`]+`/g, (m: string) => m.slice(1, -1))
                            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                            .replace(/^>+\s*/gm, '')
                            .replace(/^[-*+]\s+/gm, '')
                            .replace(/^\d+\.\s+/gm, '')
                            .replace(/\n+/g, ' ').trim();
                        const excerpt = stripped.length > 160 ? stripped.slice(0, 160).trimEnd() + '…' : stripped;
                        const initials = (resource.author.username?.[0] ?? '?').toUpperCase();
                        const isSchoolOnly = resource.visibility === 'SCHOOL_ONLY';
                        return (
                            <Link
                                key={resource.id}
                                href={`/resources/${resource.id}`}
                                className="g fade-in"
                                style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '12px', textDecoration: 'none', animationDelay: `${i * 0.04}s`, transition: 'box-shadow 0.15s, transform 0.15s' }}
                            >
                                {/* Visibility badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {isSchoolOnly ? (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.15em', color: 'var(--rose)', background: 'rgba(184,96,78,0.08)', border: '1px solid rgba(184,96,78,0.2)', borderRadius: '4px', padding: '2px 7px' }}>
                                            <Lock style={{ width: '9px', height: '9px' }} />
                                            {resource.school?.shortName ?? 'SCHOOL ONLY'}
                                        </span>
                                    ) : (
                                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.15em', color: 'var(--sage)', background: 'rgba(107,148,120,0.08)', border: '1px solid rgba(107,148,120,0.2)', borderRadius: '4px', padding: '2px 7px' }}>
                                            PUBLIC
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <div style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.25 }}>
                                    {resource.title}
                                </div>

                                {/* Excerpt */}
                                {excerpt && (
                                    <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--ink4)', lineHeight: 1.6, margin: 0 }}>
                                        {excerpt}
                                    </p>
                                )}

                                {/* Meta */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                                        background: 'rgba(107,148,120,0.15)', border: '1px solid rgba(107,148,120,0.25)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'var(--ff-mono)', fontSize: '9px', color: 'var(--sage)', fontWeight: 600,
                                    }}>
                                        {initials}
                                    </div>
                                    <span style={{ fontFamily: 'var(--ff-ui)', fontSize: '12px', color: 'var(--ink4)' }}>{resource.author.username}</span>
                                    {resource.author.isAdmin && <span className="tag tag-sage" style={{ fontSize: '9px' }}>Admin</span>}
                                    {resource.author.isTeacher && !resource.author.isAdmin && <span className="tag tag-sage" style={{ fontSize: '9px' }}>Teacher</span>}
                                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', whiteSpace: 'nowrap' }}>{date}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
