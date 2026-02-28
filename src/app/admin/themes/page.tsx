import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { THEMES } from '@/lib/contestThemes'

export default async function AdminThemesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) redirect('/')

  let customThemes: any[] = []
  try {
    customThemes = await prisma.theme.findMany({ orderBy: { createdAt: 'asc' } })
  } catch { /* DB unavailable */ }

  const builtins = Object.values(THEMES)

  const MONO = 'var(--ff-mono)'

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.22em', color: 'var(--sage)', marginBottom: '10px', textTransform: 'uppercase' }}>
          Admin · Themes
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '36px', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Contest Themes
          </h1>
          <Link href="/admin/themes/new" className="btn btn-sage">+ New Theme</Link>
        </div>
      </div>

      {/* Builtin themes */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.16em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '16px' }}>
          Built-in Presets ({builtins.length})
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {builtins.map(t => (
            <div
              key={t.slug}
              style={{
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <div style={{
                background: t.bg,
                padding: '20px 18px',
                minHeight: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}>
                <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '15px', color: t.textPrimary }}>{t.name}</div>
                <div style={{ fontFamily: MONO, fontSize: '9px', color: t.textMuted, marginTop: '2px' }}>{t.tagline}</div>
              </div>
              <div style={{ background: 'var(--surface)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.accent, flexShrink: 0 }} />
                <span style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink5)', flex: 1 }}>{t.slug}</span>
                <span style={{ fontFamily: MONO, fontSize: '9px', color: 'var(--ink5)', opacity: 0.5 }}>builtin</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom themes */}
      <div>
        <p style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.16em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '16px' }}>
          Custom Themes ({customThemes.length})
        </p>
        {customThemes.length === 0 ? (
          <div className="g" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink5)', fontFamily: MONO, fontSize: '12px' }}>
            No custom themes yet. <Link href="/admin/themes/new" style={{ color: 'var(--sage)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Create one →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {customThemes.map((t: any) => {
              const cfg = t.config as any
              return (
                <Link
                  key={t.slug}
                  href={`/admin/themes/${t.slug}/edit`}
                  style={{ textDecoration: 'none', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', display: 'block' }}
                >
                  <div style={{
                    background: cfg.bg ?? 'linear-gradient(160deg, #1a1a2e, #16213e)',
                    padding: '20px 18px',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    position: 'relative',
                  }}>
                    {cfg.doodlePaths?.hero && (
                      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', backgroundImage: `url(${cfg.doodlePaths.hero})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', opacity: cfg.doodleOpacity ?? 0.1 }} />
                    )}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '15px', color: cfg.textPrimary ?? '#fff' }}>{t.name}</div>
                      <div style={{ fontFamily: MONO, fontSize: '9px', color: cfg.textMuted ?? 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{cfg.tagline}</div>
                    </div>
                  </div>
                  <div style={{ background: 'var(--surface)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cfg.accent ?? '#6b9478', flexShrink: 0 }} />
                    <span style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink5)', flex: 1 }}>{t.slug}</span>
                    <span style={{ fontFamily: MONO, fontSize: '9px', color: 'var(--sage)' }}>Edit →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
