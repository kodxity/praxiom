import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MarkdownContent } from '@/components/MarkdownContent';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ResourcePage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const session = await getServerSession(authOptions);

    let resource: any = null;
    try {
        resource = await prisma.resource.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, username: true, isAdmin: true, isTeacher: true } },
                school: { select: { name: true, shortName: true } },
            },
        });
    } catch { /* DB unavailable */ }

    if (!resource) notFound();

    // School-only access control
    if (resource.visibility === 'SCHOOL_ONLY') {
        if (!session?.user?.id) {
            redirect('/login');
        }
        let userSchoolId: string | null = null;
        try {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { schoolId: true },
            });
            userSchoolId = user?.schoolId ?? null;
        } catch { /* DB unavailable */ }

        if (!userSchoolId || userSchoolId !== resource.schoolId) {
            // Show access denied rather than redirect to avoid loop
            return (
                <div style={{ maxWidth: '680px', margin: '0 auto', padding: '80px 1.75rem', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--rose)', marginBottom: '16px' }}>ACCESS RESTRICTED</p>
                    <p style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', fontStyle: 'italic', color: 'var(--ink)', marginBottom: '12px' }}>
                        School-only resource
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--ink4)', marginBottom: '28px' }}>
                        This resource is only available to members of {resource.school?.name ?? 'a specific school'}.
                    </p>
                    <Link href="/resources" className="btn btn-ink">Back to Resources</Link>
                </div>
            );
        }
    }

    const date = new Date(resource.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const words = resource.content.split(/\s+/).length;
    const rt = `${Math.max(1, Math.round(words / 200))} min read`;
    const initials = resource.author.username.slice(0, 2).toUpperCase();
    const isSchoolOnly = resource.visibility === 'SCHOOL_ONLY';
    const canEdit = session?.user?.isAdmin || (session?.user?.isTeacher && resource.author.id === session.user.id);

    return (
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

            {/* Back link + actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <Link href="/resources" style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    ← Back to Resources
                </Link>
                {canEdit && (
                    <Link
                        href={`/resources/${id}/edit`}
                        style={{ fontFamily: 'var(--ff-ui)', fontSize: '12px', fontWeight: 500, color: 'var(--ink3)', textDecoration: 'none', padding: '6px 14px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'transparent', transition: 'all 0.15s' }}
                    >
                        Edit
                    </Link>
                )}
            </div>

            {/* Article */}
            <article className="g" style={{ padding: '36px 40px', marginBottom: '24px' }}>

                {/* Visibility badge */}
                {isSchoolOnly && (
                    <div style={{ marginBottom: '16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.15em', color: 'var(--rose)', background: 'rgba(184,96,78,0.08)', border: '1px solid rgba(184,96,78,0.2)', borderRadius: '4px', padding: '3px 8px' }}>
                            <Lock style={{ width: '9px', height: '9px' }} />
                            {resource.school?.shortName ?? 'SCHOOL ONLY'}
                        </span>
                    </div>
                )}

                {/* Title */}
                <h1 style={{ fontFamily: 'var(--ff-display)', fontWeight: 400, fontSize: 'clamp(24px, 4vw, 36px)', lineHeight: 1.12, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: '20px' }}>
                    {resource.title}
                </h1>

                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(107,148,120,0.15)', border: '1px solid rgba(107,148,120,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--sage)', fontWeight: 600,
                    }}>
                        {initials}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 600, color: 'var(--ink2)' }}>
                                {resource.author.username}
                            </span>
                            {resource.author.isAdmin && <span className="tag tag-sage" style={{ fontSize: '9px' }}>Admin</span>}
                            {resource.author.isTeacher && !resource.author.isAdmin && <span className="tag tag-sage" style={{ fontSize: '9px' }}>Teacher</span>}
                        </div>
                        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)' }}>
                            {date} &middot; {rt}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <MarkdownContent content={resource.content} />
            </article>
        </div>
    );
}
