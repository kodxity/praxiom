'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const MONO = 'var(--ff-mono)'
const LABEL: React.CSSProperties = {
  display: 'block', fontFamily: MONO, fontSize: '10px',
  letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '8px',
}
const BLEND_MODES = ['screen', 'multiply', 'overlay', 'soft-light', 'color-dodge']
const DISPLAY_FONTS = ['Instrument Serif', 'Cinzel', 'Playfair Display', 'Cormorant Garamond', 'JetBrains Mono', 'Lora', 'EB Garamond']

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface ThemeFormProps {
  initial?: Record<string, any>
  slug?: string // if set, we're editing (PATCH); otherwise new (POST)
  onDone?: () => void
}

export function ThemeForm({ initial, slug: editSlug, onDone }: ThemeFormProps) {
  const router = useRouter()
  const isEdit = !!editSlug

  const [name, setName]               = useState(initial?.name      ?? '')
  const [slug, setSlug]               = useState(editSlug            ?? '')
  const [slugLocked, setSlugLocked]   = useState(isEdit)
  const [tagline, setTagline]         = useState(initial?.tagline    ?? '')
  const [navVariant, setNavVariant]   = useState<'dark'|'light'>(initial?.navVariant ?? 'dark')
  const [bg, setBg]                   = useState(initial?.bg         ?? 'linear-gradient(160deg, #0d1a12 0%, #0a140d 100%)')
  const [bgSecondary, setBgSecondary] = useState(initial?.bgSecondary ?? '#091009')
  const [accent, setAccent]           = useState(initial?.accent     ?? '#6db87a')
  const [displayFont, setDisplayFont] = useState(initial?.displayFont ?? 'Instrument Serif')
  const [heroImg, setHeroImg]         = useState(initial?.doodlePaths?.hero ?? '')
  const [bgImg, setBgImg]             = useState(initial?.doodlePaths?.background ?? '')
  const [blendMode, setBlendMode]     = useState(initial?.doodleBlend   ?? 'screen')
  const [opacity, setOpacity]         = useState(initial?.doodleOpacity ?? 0.10)
  const [grain, setGrain]             = useState(initial?.grainOverlay  ?? true)
  const [grid, setGrid]               = useState(initial?.gridOverlay   ?? false)
  const [glowColor, setGlowColor]     = useState(initial?.glowColor    ?? '')

  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')

  // Auto-generate slug from name (only if not locked/editing)
  useEffect(() => {
    if (!slugLocked && name) setSlug(slugify(name))
  }, [name, slugLocked])

  // Swap default bg gradient when nav variant changes (only if user hasn't customized it yet)
  useEffect(() => {
    if (navVariant === 'light' && bg.includes('#0d1a12')) {
      setBg('linear-gradient(160deg, #eeeae3 0%, #e8e3db 100%)')
      setBgSecondary('#e4ded6')
    } else if (navVariant === 'dark' && bg.includes('#eeeae3')) {
      setBg('linear-gradient(160deg, #0d1a12 0%, #0a140d 100%)')
      setBgSecondary('#091009')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navVariant])

  const payload = () => ({
    slug, name, tagline, navVariant, bg, bgSecondary, accent, displayFont,
    doodlePaths: { hero: heroImg, background: bgImg, empty: '', problemDivider: '' },
    doodleBlend: blendMode, doodleOpacity: opacity,
    grainOverlay: grain, gridOverlay: grid,
    ...(glowColor ? { glowColor } : {}),
  })

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      const res = await fetch(
        isEdit ? `/api/themes/${editSlug}` : '/api/themes',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload()),
        }
      )
      if (res.ok) {
        if (!isEdit) {
          router.push(`/admin/themes/${slug}/edit`)
          router.refresh()
        } else {
          setSuccess('Theme saved.')
          router.refresh()
          onDone?.()
        }
      } else {
        const txt = await res.text()
        setError(txt || 'Failed to save.')
      }
    } catch { setError('Network error.') }
    finally { setSaving(false) }
  }

  async function deleteTheme() {
    setDeleting(true)
    const res = await fetch(`/api/themes/${editSlug}`, { method: 'DELETE' })
    if (res.ok || res.status === 204) {
      router.push('/admin/themes')
      router.refresh()
    } else {
      setError('Failed to delete.')
      setDeleting(false)
    }
  }

  /* ── live preview ── */
  const previewStyle: React.CSSProperties = {
    background: bg,
    borderRadius: '12px',
    overflow: 'hidden',
    border: `1px solid ${accent}33`,
    fontFamily: displayFont,
    position: 'relative',
    minHeight: '140px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '20px 22px',
  }

  const isDark = navVariant === 'dark'
  const previewText = isDark ? 'rgba(220,240,220,0.92)' : '#18160f'
  const previewMuted = isDark ? 'rgba(180,200,185,0.55)' : '#8a8274'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

      {/* ── Form ── */}
      <form onSubmit={save}>
        <div className="g" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* Name + Slug */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={LABEL}>Theme Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required className="input" style={{ width: '100%' }} placeholder="Midnight Eclipse" />
            </div>
            <div>
              <label style={LABEL}>Slug (URL key)</label>
              <input
                value={slug}
                onChange={e => { setSlug(e.target.value); setSlugLocked(true) }}
                required
                disabled={isEdit}
                className="input"
                style={{ width: '100%', fontFamily: MONO, fontSize: '12px', opacity: isEdit ? 0.6 : 1 }}
                placeholder="midnight-eclipse"
              />
              {!isEdit && <p style={{ fontFamily: MONO, fontSize: '9px', color: 'var(--ink5)', marginTop: '4px' }}>Auto-generated from name. Must be unique.</p>}
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label style={LABEL}>Tagline</label>
            <input value={tagline} onChange={e => setTagline(e.target.value)} className="input" style={{ width: '100%' }} placeholder="A short dramatic line…" />
          </div>

          {/* Dark / Light toggle */}
          <div>
            <label style={LABEL}>Style</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['dark', 'light'] as const).map(v => (
                <button type="button" key={v} onClick={() => setNavVariant(v)}
                  style={{ fontFamily: MONO, fontSize: '11px', padding: '7px 18px', borderRadius: '8px', cursor: 'pointer', border: navVariant === v ? '1.5px solid var(--sage)' : '1px solid var(--border)', background: navVariant === v ? 'var(--sage-bg)' : 'transparent', color: navVariant === v ? 'var(--sage)' : 'var(--ink4)', transition: 'all 0.12s' }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={LABEL}>Background (CSS gradient or color)</label>
              <input value={bg} onChange={e => setBg(e.target.value)} className="input" style={{ width: '100%', fontFamily: MONO, fontSize: '12px' }} placeholder="linear-gradient(160deg, #0d1a12 0%, #0a140d 100%)" />
            </div>
            <div>
              <label style={LABEL}>BG Secondary</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="color" value={bgSecondary.length === 7 ? bgSecondary : '#091009'} onChange={e => setBgSecondary(e.target.value)}
                  style={{ width: '36px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }} />
                <input value={bgSecondary} onChange={e => setBgSecondary(e.target.value)} className="input" style={{ width: '90px', fontFamily: MONO, fontSize: '11px' }} />
              </div>
            </div>
          </div>

          {/* Accent + Display font */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={LABEL}>Accent Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="color" value={accent} onChange={e => setAccent(e.target.value)}
                  style={{ width: '44px', height: '44px', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }} />
                <input value={accent} onChange={e => setAccent(e.target.value)} className="input" style={{ width: '94px', fontFamily: MONO, fontSize: '12px' }} />
              </div>
              <p style={{ fontFamily: MONO, fontSize: '9px', color: 'var(--ink5)', marginTop: '4px' }}>Drives buttons, badges, links, glow</p>
            </div>
            <div>
              <label style={LABEL}>Display Font</label>
              <select value={displayFont} onChange={e => setDisplayFont(e.target.value)} className="input" style={{ width: '100%' }}>
                {DISPLAY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Glow color override */}
          <div>
            <label style={LABEL}>Glow Color Override <span style={{ opacity: 0.5, fontWeight: 300 }}>(leave blank to auto-derive from accent)</span></label>
            <input value={glowColor} onChange={e => setGlowColor(e.target.value)} className="input" style={{ width: '100%', fontFamily: MONO, fontSize: '12px' }} placeholder="rgba(109,184,122,0.28)" />
          </div>

          {/* Images */}
          <div style={{ paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '14px' }}>Images (SVG or PNG — leave blank for none)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={LABEL}>Hero Image Path / URL</label>
                <input value={heroImg} onChange={e => setHeroImg(e.target.value)} className="input" style={{ width: '100%', fontFamily: MONO, fontSize: '12px' }} placeholder="/doodles/my-theme/hero.svg  or  /images/hero.png" />
              </div>
              <div>
                <label style={LABEL}>Background Image Path / URL</label>
                <input value={bgImg} onChange={e => setBgImg(e.target.value)} className="input" style={{ width: '100%', fontFamily: MONO, fontSize: '12px' }} placeholder="/doodles/my-theme/bg.png  or  https://…" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'end' }}>
                <div>
                  <label style={LABEL}>Blend Mode</label>
                  <select value={blendMode} onChange={e => setBlendMode(e.target.value)} className="input" style={{ width: '100%' }}>
                    {BLEND_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div style={{ minWidth: '140px' }}>
                  <label style={LABEL}>Opacity ({(opacity * 100).toFixed(0)}%)</label>
                  <input type="range" min="0" max="1" step="0.01" value={opacity} onChange={e => setOpacity(Number(e.target.value))}
                    style={{ width: '100%', accentColor: accent }} />
                </div>
              </div>
            </div>
          </div>

          {/* Overlays */}
          <div style={{ display: 'flex', gap: '24px' }}>
            {([['grain', grain, setGrain], ['grid', grid, setGrid]] as any[]).map(([lbl, val, set]) => (
              <label key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: MONO, fontSize: '11px', color: 'var(--ink4)' }}>
                <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} style={{ accentColor: accent, width: '14px', height: '14px' }} />
                {lbl} overlay
              </label>
            ))}
          </div>

          {error   && <p style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--rose)',  margin: 0 }}>{error}</p>}
          {success && <p style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--sage)',  margin: 0 }}>{success}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
            <Link href="/admin/themes" className="btn btn-ghost" style={{ fontSize: '13px' }}>Cancel</Link>
            <button type="submit" className="btn btn-sage" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Theme'}</button>
          </div>
        </div>
      </form>

      {/* ── Sidebar: Live preview + Danger zone ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>

        {/* Preview */}
        <div className="g" style={{ padding: '20px' }}>
          <p style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink5)', textTransform: 'uppercase', marginBottom: '14px' }}>Preview</p>
          <div style={previewStyle}>
            {/* bg image */}
            {bgImg && (
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: opacity, mixBlendMode: blendMode as any, pointerEvents: 'none' }} />
            )}
            {/* hero image */}
            {heroImg && (
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%', backgroundImage: `url(${heroImg})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', opacity: opacity * 2, mixBlendMode: blendMode as any, pointerEvents: 'none' }} />
            )}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-block', background: `${accent}22`, border: `1px solid ${accent}55`, borderRadius: '99px', padding: '2px 10px', fontFamily: MONO, fontSize: '9px', color: accent, marginBottom: '10px' }}>Live now</div>
              <div style={{ fontFamily: displayFont, fontStyle: 'italic', fontSize: '22px', color: previewText, lineHeight: 1.15, marginBottom: '4px' }}>{name || 'Theme Name'}</div>
              <div style={{ fontFamily: MONO, fontSize: '10px', color: previewMuted }}>{tagline || 'Your tagline here'}</div>
              <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                <div style={{ background: `${accent}22`, border: `1px solid ${accent}44`, borderRadius: '8px', padding: '6px 14px', fontFamily: MONO, fontSize: '10px', color: accent }}>Register</div>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '8px', padding: '6px 14px', fontFamily: MONO, fontSize: '10px', color: previewMuted }}>Standings</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: accent }} />
            <span style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink5)' }}>{slug || 'slug'} · {navVariant}</span>
          </div>
        </div>

        {/* Danger zone (edit only) */}
        {isEdit && (
          <div className="g" style={{ padding: '20px', border: '1px solid rgba(184,96,78,0.18)', background: 'rgba(184,96,78,0.03)' }}>
            <p style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '16px', color: 'var(--rose)', marginBottom: '8px' }}>Danger Zone</p>
            <p style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink4)', marginBottom: '14px', lineHeight: 1.5 }}>
              Deleting removes the theme permanently. Contests using it will fall back to global.
            </p>
            {!confirmDelete ? (
              <button type="button" onClick={() => setConfirmDelete(true)}
                style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--rose)', background: 'rgba(184,96,78,0.10)', border: '1px solid rgba(184,96,78,0.22)', borderRadius: '7px', padding: '6px 14px', cursor: 'pointer' }}>
                Delete Theme
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--rose)' }}>Sure? Cannot be undone.</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={deleteTheme} disabled={deleting}
                    style={{ fontFamily: MONO, fontSize: '10px', color: '#fff', background: 'var(--rose)', border: 'none', borderRadius: '7px', padding: '6px 14px', cursor: 'pointer' }}>
                    {deleting ? '…' : 'Yes, Delete'}
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)}
                    style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--ink4)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
