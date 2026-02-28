import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ThemeForm } from '../ThemeForm'

export default async function NewThemePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) redirect('/')

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/admin/themes" style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '16px' }}>
          ← Themes
        </Link>
        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '8px' }}>ADMIN · NEW THEME</p>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.1 }}>
          Create Theme
        </h1>
      </div>
      <ThemeForm />
    </div>
  )
}
