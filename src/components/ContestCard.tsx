'use client'

import Link from 'next/link'

// Theme configuration for dark-themed contest cards
const DARK_THEMES: Record<string, {
  bg: string; glow: string; eyebrowColor: string;
  titleColor: string; descColor: string; statsBg: string; statsBorder: string;
  statsTextVal: string; statsTextLabel: string; doodleText: string;
  btnBg: string; btnColor: string; btnBorder: string;
  liveDotColor: string; tagColor: string;
}> = {
  'jade-city': {
    bg: 'linear-gradient(155deg, #0a1a0e, #0d1812, #081209)',
    glow: 'radial-gradient(ellipse at 30% 20%, rgba(107,184,122,0.07), transparent 55%)',
    eyebrowColor: 'rgba(150,220,160,0.65)',
    titleColor: 'rgba(200,240,200,0.92)',
    descColor: 'rgba(150,200,160,0.55)',
    statsBg: 'rgba(150,220,160,0.05)',
    statsBorder: 'rgba(150,220,160,0.12)',
    statsTextVal: 'rgba(200,240,200,0.85)',
    statsTextLabel: 'rgba(150,200,155,0.5)',
    doodleText: 'rgba(150,220,160,0.35)',
    btnBg: 'rgba(109,184,122,0.18)',
    btnColor: 'rgba(180,240,190,0.9)',
    btnBorder: 'rgba(109,184,122,0.35)',
    liveDotColor: 'rgba(130,220,150,0.85)',
    tagColor: 'rgba(150,220,160,0.55)',
  },
  'devil-mountain': {
    bg: 'linear-gradient(155deg, #1a0808, #2a0d0d, #150606)',
    glow: 'radial-gradient(ellipse at 30% 20%, rgba(196,90,58,0.08), transparent 55%)',
    eyebrowColor: 'rgba(220,120,80,0.65)',
    titleColor: 'rgba(255,220,200,0.92)',
    descColor: 'rgba(200,150,130,0.55)',
    statsBg: 'rgba(220,120,80,0.05)',
    statsBorder: 'rgba(220,120,80,0.12)',
    statsTextVal: 'rgba(255,220,200,0.85)',
    statsTextLabel: 'rgba(200,150,130,0.5)',
    doodleText: 'rgba(220,120,80,0.35)',
    btnBg: 'rgba(196,90,58,0.18)',
    btnColor: 'rgba(255,200,180,0.9)',
    btnBorder: 'rgba(196,90,58,0.35)',
    liveDotColor: 'rgba(220,100,60,0.85)',
    tagColor: 'rgba(220,120,80,0.55)',
  },
  'murder-mystery': {
    bg: 'linear-gradient(155deg, #12101e, #181428, #0f0d1a)',
    glow: 'radial-gradient(ellipse at 30% 20%, rgba(120,80,180,0.08), transparent 55%)',
    eyebrowColor: 'rgba(160,130,220,0.65)',
    titleColor: 'rgba(220,210,250,0.92)',
    descColor: 'rgba(160,140,200,0.55)',
    statsBg: 'rgba(160,130,220,0.05)',
    statsBorder: 'rgba(160,130,220,0.12)',
    statsTextVal: 'rgba(220,210,250,0.85)',
    statsTextLabel: 'rgba(160,140,200,0.5)',
    doodleText: 'rgba(160,130,220,0.35)',
    btnBg: 'rgba(155,127,212,0.18)',
    btnColor: 'rgba(210,200,250,0.9)',
    btnBorder: 'rgba(155,127,212,0.35)',
    liveDotColor: 'rgba(160,120,220,0.85)',
    tagColor: 'rgba(160,130,220,0.55)',
  },
  'ancient-ruins': {
    bg: 'linear-gradient(155deg, #2e2210, #241808, #1c1406)',
    glow: 'radial-gradient(ellipse at 30% 20%, rgba(196,154,58,0.08), transparent 55%)',
    eyebrowColor: 'rgba(220,180,80,0.65)',
    titleColor: 'rgba(255,240,200,0.90)',
    descColor: 'rgba(195,175,130,0.55)',
    statsBg: 'rgba(220,180,80,0.05)',
    statsBorder: 'rgba(220,180,80,0.14)',
    statsTextVal: 'rgba(255,240,200,0.85)',
    statsTextLabel: 'rgba(195,175,130,0.5)',
    doodleText: 'rgba(220,180,80,0.35)',
    btnBg: 'rgba(196,154,58,0.18)',
    btnColor: 'rgba(255,230,170,0.9)',
    btnBorder: 'rgba(196,154,58,0.35)',
    liveDotColor: 'rgba(220,160,60,0.85)',
    tagColor: 'rgba(220,180,80,0.55)',
  },
  'cipher-lab': {
    bg: 'linear-gradient(155deg, #080e1a, #0a1220, #060b14)',
    glow: 'radial-gradient(ellipse at 30% 20%, rgba(74,159,212,0.08), transparent 55%)',
    eyebrowColor: 'rgba(100,180,255,0.65)',
    titleColor: 'rgba(180,220,255,0.90)',
    descColor: 'rgba(120,165,210,0.55)',
    statsBg: 'rgba(100,180,255,0.04)',
    statsBorder: 'rgba(100,180,255,0.12)',
    statsTextVal: 'rgba(180,220,255,0.85)',
    statsTextLabel: 'rgba(120,165,210,0.5)',
    doodleText: 'rgba(100,180,255,0.30)',
    btnBg: 'rgba(74,159,212,0.18)',
    btnColor: 'rgba(160,210,255,0.9)',
    btnBorder: 'rgba(74,159,212,0.35)',
    liveDotColor: 'rgba(80,160,255,0.85)',
    tagColor: 'rgba(100,180,255,0.55)',
  },
  'enchanted-forest': {
    bg: 'linear-gradient(155deg, #1a2e1a, #0d2614, #0b1e0e)',
    glow: 'radial-gradient(ellipse at 30% 20%, rgba(114,184,74,0.08), transparent 55%)',
    eyebrowColor: 'rgba(140,220,100,0.65)',
    titleColor: 'rgba(200,240,180,0.90)',
    descColor: 'rgba(140,185,120,0.55)',
    statsBg: 'rgba(50,200,80,0.05)',
    statsBorder: 'rgba(140,220,100,0.12)',
    statsTextVal: 'rgba(200,240,180,0.85)',
    statsTextLabel: 'rgba(140,185,120,0.5)',
    doodleText: 'rgba(140,220,100,0.30)',
    btnBg: 'rgba(114,184,74,0.18)',
    btnColor: 'rgba(190,240,160,0.9)',
    btnBorder: 'rgba(114,184,74,0.35)',
    liveDotColor: 'rgba(100,200,70,0.85)',
    tagColor: 'rgba(140,220,100,0.55)',
  },
  'the-conclave': {
    bg: 'linear-gradient(155deg, #0e0e16, #141420, #0b0b12)',
    glow: 'radial-gradient(ellipse at 30% 20%, rgba(138,122,219,0.08), transparent 55%)',
    eyebrowColor: 'rgba(180,160,255,0.65)',
    titleColor: 'rgba(220,220,240,0.90)',
    descColor: 'rgba(160,155,195,0.55)',
    statsBg: 'rgba(255,255,255,0.04)',
    statsBorder: 'rgba(180,160,255,0.12)',
    statsTextVal: 'rgba(220,220,240,0.85)',
    statsTextLabel: 'rgba(160,155,195,0.5)',
    doodleText: 'rgba(150,130,255,0.30)',
    btnBg: 'rgba(138,122,219,0.18)',
    btnColor: 'rgba(210,200,255,0.9)',
    btnBorder: 'rgba(138,122,219,0.35)',
    liveDotColor: 'rgba(150,130,255,0.85)',
    tagColor: 'rgba(180,160,255,0.55)',
  },
}

interface Contest {
  id: string
  title: string
  description?: string | null
  startTime: Date
  endTime: Date
  themeSlug?: string | null
  _count?: { registrations?: number; problems?: number }
}

interface Props {
  contest: Contest
  active?: boolean
  past?: boolean
  isAdmin?: boolean
  animDelay?: number
}

function dateDiff(from: Date, to: Date) {
  const diff = to.getTime() - from.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

function durationMinutes(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / 60000)
}

function shortDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ContestCard({ contest, active, past, isAdmin, animDelay = 0 }: Props) {
  const participants = contest._count?.registrations ?? 0
  const problemCount = contest._count?.problems ?? 0
  const duration = durationMinutes(new Date(contest.startTime), new Date(contest.endTime))
  const now = new Date()
  const daysUntil = dateDiff(now, new Date(contest.startTime))
  const themeSlug = contest.themeSlug ?? 'global'
  const darkTheme = DARK_THEMES[themeSlug]

  // ── Dark-themed card (jade-city, devil-mountain, etc.) ─────────────────
  if (darkTheme) {
    const t = darkTheme
    return (
      <div
        className="fade-in"
        style={{
          width: '360px',
          borderRadius: 'var(--r-xl)',
          overflow: 'hidden',
          position: 'relative',
          background: t.bg,
          padding: '28px',
          animationDelay: `${animDelay}s`,
          flexShrink: 0,
        }}
      >
        {/* Ambient glow overlay */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: t.glow, pointerEvents: 'none' }} />
        {/* Doodle background layer */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: `url(/doodles/${themeSlug}/bg.svg)`, backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'screen', opacity: 0.08, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Theme eyebrow */}
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.22em', color: t.eyebrowColor, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{themeSlug.toUpperCase().replace('-', ' ')}</span>
            {active && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: t.liveDotColor, display: 'inline-block', boxShadow: `0 0 6px ${t.liveDotColor}` }} />
                LIVE
              </span>
            )}
            {past && <span style={{ color: t.tagColor }}>ENDED {shortDate(new Date(contest.endTime))}</span>}
            {!active && !past && <span style={{ color: t.tagColor }}>{shortDate(new Date(contest.startTime))} · {daysUntil}D</span>}
          </div>

          {/* Title */}
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '24px', fontStyle: 'italic', color: t.titleColor, marginBottom: '8px', lineHeight: 1.15 }}>
            {contest.title}
          </div>

          {/* Description */}
          <div style={{ fontSize: '13px', fontWeight: 300, color: t.descColor, marginBottom: '20px', lineHeight: 1.6, minHeight: '38px' }}>
            {contest.description ?? ''}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            {[
              { val: participants > 0 ? participants : '-', label: active ? 'Live' : 'Registered' },
              { val: problemCount > 0 ? problemCount : '-', label: 'Problems' },
              { val: duration > 0 ? `${duration}m` : '-', label: active ? 'Remaining' : 'Duration' },
            ].map(({ val, label }) => (
              <div key={label} style={{ flex: 1, background: t.statsBg, border: `1px solid ${t.statsBorder}`, borderRadius: 'var(--r)', padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: '20px', color: t.statsTextVal }}>{val}</div>
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.1em', color: t.statsTextLabel, textTransform: 'uppercase', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Doodle slot */}
          <div style={{ border: `2px dashed ${t.doodleText}`, borderRadius: 'var(--r)', padding: '10px', textAlign: 'center', marginBottom: '16px', opacity: 0.8 }}>
            <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.1em', color: t.doodleText, margin: 0 }}>✏ DOODLE SLOT - {themeSlug.replace('-', ' ')} art</p>
          </div>

          {/* CTA */}
          <Link
            href={`/contests/${contest.id}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: '12px 20px',
              background: t.btnBg, border: `1px solid ${t.btnBorder}`,
              borderRadius: 'var(--r)',
              color: t.btnColor,
              fontFamily: 'var(--ff-ui)', fontSize: '14px', fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            {active ? 'Join Live →' : past ? 'View Results' : 'Register →'}
          </Link>

          {isAdmin && (
            <Link
              href={`/admin/contests/${contest.id}/edit`}
              style={{ display: 'block', textAlign: 'center', marginTop: '8px', fontFamily: 'var(--ff-mono)', fontSize: '10px', color: t.doodleText, textDecoration: 'none', letterSpacing: '0.06em' }}
            >
              Manage
            </Link>
          )}
        </div>
      </div>
    )
  }

  // ── Default (light/global) card ─────────────────────────────────────────
  return (
    <div
      className="g contest-card fade-in"
      style={{ width: '360px', animationDelay: `${animDelay}s` }}
    >
      {/* Status */}
      <div style={{ marginBottom: '14px' }}>
        {active ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="live-dot" />
            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--rose)' }}>LIVE NOW</span>
          </div>
        ) : past ? (
          <span className="tag">ENDED  {shortDate(new Date(contest.endTime))}</span>
        ) : (
          <span className="tag tag-amber">{shortDate(new Date(contest.startTime))} &middot; {daysUntil} DAYS</span>
        )}
      </div>

      {/* Title */}
      <div className="contest-title">{contest.title}</div>

      {/* Description */}
      <div className="contest-desc" style={{ minHeight: contest.description ? undefined : '42px' }}>
        {contest.description ?? ''}
      </div>

      {/* Stats */}
      <div className="contest-stats">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div className="cstat-val">{participants > 0 ? participants : ''}</div>
          <div className="cstat-label">{active ? 'Live' : 'Registered'}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div className="cstat-val">{problemCount > 0 ? problemCount : ''}</div>
          <div className="cstat-label">Problems</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div className="cstat-val">{duration > 0 ? <>{duration}<span style={{ fontSize: '14px' }}> min</span></> : ''}</div>
          <div className="cstat-label">{active ? 'Remaining' : 'Duration'}</div>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/contests/${contest.id}`}
        className={`btn ${active ? 'btn-ink' : past ? 'btn-glass' : 'btn-sage'}`}
        style={{ width: '100%', justifyContent: 'center', marginTop: '18px', display: 'flex' }}
      >
        {active ? 'Join Live' : past ? 'View Results' : 'Register'}
      </Link>

      {isAdmin && (
        <Link
          href={`/admin/contests/${contest.id}/edit`}
          style={{ display: 'block', textAlign: 'center', marginTop: '8px', fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink5)', textDecoration: 'none', letterSpacing: '0.06em' }}
        >
          Manage
        </Link>
      )}
    </div>
  )
}
