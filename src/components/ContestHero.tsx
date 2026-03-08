'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Calendar, Clock, Users, BookOpen } from 'lucide-react'
import { Badge } from '@/components/Badge'

interface Props {
  contestId: string
  title: string
  description?: string | null
  startTime: Date
  endTime: Date
  problemCount?: number
  participantCount?: number
  isRegistered?: boolean
  isActive?: boolean
  isPast?: boolean
  isUpcoming?: boolean
  isLoggedIn?: boolean
  isAdmin?: boolean
}

function formatDate(d: Date) {
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getDuration(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function ContestHero({
  contestId,
  title,
  description,
  startTime,
  endTime,
  problemCount = 0,
  participantCount = 0,
  isRegistered = false,
  isActive = false,
  isPast = false,
  isUpcoming = false,
  isLoggedIn = false,
  isAdmin = false,
}: Props) {
  const theme = useTheme()
  const isDark = theme.navVariant === 'dark'
  const router = useRouter()
  const [registering, setRegistering] = useState(false)

  async function handleRegister() {
    if (registering) return
    setRegistering(true)
    try {
      await fetch(`/api/contests/${contestId}/register`, { method: 'POST' })
      router.refresh()
    } finally {
      setRegistering(false)
    }
  }

  if (isDark) {
    // ── Dark-themed hero (uses theme variables - works for any dark theme) ──
    const accentRgba = (a: number) => `${theme.accent}${Math.round(a * 255).toString(16).padStart(2, '0')}`
    return (
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '48vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        {/* Ambient glow */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: theme.glowColor ? `radial-gradient(ellipse at 25% 40%, ${theme.glowColor}, transparent 55%)` : undefined, pointerEvents: 'none', zIndex: 0 }} />
        {/* Doodle layer */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${theme.doodlePaths.hero})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', mixBlendMode: theme.doodleBlend as React.CSSProperties['mixBlendMode'], opacity: theme.doodleOpacity * 2, pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '48px 36px 40px', maxWidth: '1360px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
            <div style={{ maxWidth: '700px' }}>
              {/* Status */}
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isActive && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.1em', color: theme.textAccent }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.accent, display: 'inline-block', animation: 'pulse 1.4s ease infinite' }} />
                    LIVE NOW
                  </span>
                )}
                {isPast     && <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.1em', color: theme.textMuted }}>ENDED</span>}
                {isUpcoming && <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.1em', color: theme.textMuted }}>UPCOMING</span>}
              </div>
              {/* Eyebrow */}
              <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', color: theme.textAccent, marginBottom: '12px', margin: '0 0 12px' }}>
                {theme.name.toUpperCase()} · CONTEST
              </p>
              {/* Title */}
              <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontStyle: 'italic', color: theme.textPrimary, marginBottom: '8px', lineHeight: 1.15, maxWidth: '600px' }}>
                {title}
              </h1>
              {/* Description */}
              {description && (
                <p style={{ fontSize: '14px', fontWeight: 300, color: theme.textSecondary, marginBottom: '24px', lineHeight: 1.6, maxWidth: '520px' }}>
                  {description}
                </p>
              )}
              {/* Metadata */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontFamily: 'var(--ff-mono)', fontSize: '12px', color: theme.textMuted, marginBottom: '24px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar style={{ width: '13px', height: '13px' }} />{formatDate(startTime)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock style={{ width: '13px', height: '13px' }} />{getDuration(startTime, endTime)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><BookOpen style={{ width: '13px', height: '13px' }} />{problemCount} problems</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Users style={{ width: '13px', height: '13px' }} />{participantCount} participants</span>
              </div>
              {/* Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {isLoggedIn && !isPast && !isRegistered && !isAdmin && (
                  <button onClick={handleRegister} disabled={registering} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '12px 28px', borderRadius: '10px',
                    fontFamily: 'var(--ff-ui)', fontSize: '14px', fontWeight: 500,
                    background: theme.accentBg, border: `1px solid ${theme.accentBorder}`,
                    color: theme.textPrimary, transition: 'all 0.15s',
                    cursor: registering ? 'wait' : 'pointer', opacity: registering ? 0.7 : 1,
                  }}>
                    {registering ? 'Registering…' : 'Register →'}
                  </button>
                )}
                {isLoggedIn && !isPast && isRegistered && (
                  <Link href={`/contests/${contestId}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
                    fontFamily: 'var(--ff-ui)', fontSize: '14px', fontWeight: 500,
                    background: theme.accentBg, border: `1px solid ${theme.accentBorder}`,
                    color: theme.textPrimary,
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.accent }} />
                    In Progress
                  </Link>
                )}
                <Link href={`/contests/${contestId}/standings`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
                  fontFamily: 'var(--ff-ui)', fontSize: '14px', fontWeight: 400,
                  background: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.surfaceBorder}`,
                  color: theme.textSecondary, transition: 'all 0.15s',
                }}>
                  Standings
                </Link>
                <Link href={`/contests/${contestId}/submissions`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
                  fontFamily: 'var(--ff-ui)', fontSize: '14px', fontWeight: 400,
                  background: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.surfaceBorder}`,
                  color: theme.textSecondary, transition: 'all 0.15s',
                }}>
                  Submissions
                </Link>
                {isAdmin && (
                  <Link href={`/admin/contests/${contestId}/edit`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '10px', textDecoration: 'none',
                    fontFamily: 'var(--ff-mono)', fontSize: '11px',
                    background: 'rgba(255,255,255,0.04)', border: `1px solid ${theme.surfaceBorder}`,
                    color: theme.textMuted, transition: 'all 0.15s',
                  }}>
                    Manage
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Default (light) theme ─────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '52vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        padding: '5rem 0 4rem',
        overflow: 'hidden',
      }}
    >
      {/* Hero doodle art */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 0, top: 0, bottom: 0,
          width: '40%',
          zIndex: 0,
          backgroundImage: `url(${theme.doodlePaths.hero})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right center',
          mixBlendMode: theme.doodleBlend as React.CSSProperties['mixBlendMode'],
          opacity: theme.doodleOpacity * 2.5,
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        {/* Status badge */}
        <div style={{ marginBottom: '18px' }}>
          {isActive   && <Badge variant="sage">● Live now</Badge>}
          {isPast     && <Badge variant="default"><span style={{ opacity: 0.7 }}>Ended</span></Badge>}
          {isUpcoming && <Badge variant="slate">Upcoming</Badge>}
        </div>

        {/* Eyebrow */}
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.12em', color: 'var(--ink4)', textTransform: 'uppercase', marginBottom: '12px' }}>
          PRAXIS · CONTEST
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--ff-display)',
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontStyle: 'italic',
            color: 'var(--ink)',
            lineHeight: 1.1,
            marginBottom: description ? '1rem' : '2rem',
            maxWidth: '640px',
          }}
        >
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p
            style={{
              color: 'var(--ink3)',
              fontSize: '1.05rem',
              maxWidth: '520px',
              lineHeight: 1.7,
              marginBottom: '2rem',
            }}
          >
            {description}
          </p>
        )}

        {/* Metadata strip */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '2.5rem', color: 'var(--ink4)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar style={{ width: '14px', height: '14px' }} />
            {formatDate(startTime)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock style={{ width: '14px', height: '14px' }} />
            {getDuration(startTime, endTime)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen style={{ width: '14px', height: '14px' }} />
            {problemCount} problems
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users style={{ width: '14px', height: '14px' }} />
            {participantCount} participants
          </span>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {isLoggedIn && !isPast && !isRegistered && !isAdmin && (
            <button
              onClick={handleRegister}
              disabled={registering}
              className="btn"
              style={{
                padding: '12px 28px',
                background: 'var(--sage)',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(107,148,120,0.25)',
                fontSize: '15px',
                cursor: registering ? 'wait' : 'pointer',
                opacity: registering ? 0.7 : 1,
              }}
            >
              {registering ? 'Registering…' : 'Register for Contest'}
            </button>
          )}
          {isLoggedIn && !isPast && isRegistered && (
            <Link
              href={`/contests/${contestId}`}
              className="btn"
              style={{
                padding: '12px 28px',
                background: 'var(--sage)',
                color: '#fff',
                fontSize: '15px',
                textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
              In Progress
            </Link>
          )}
          <Link
            href={`/contests/${contestId}/standings`}
            className="btn btn-ghost"
            style={{ padding: '11px 22px', fontSize: '15px' }}
          >
            Standings
          </Link>
          {isAdmin && (
            <Link
              href={`/admin/contests/${contestId}/edit`}
              className="btn"
              style={{
                padding: '9px 18px',
                background: 'var(--sage-bg)',
                border: '1px solid var(--sage-border)',
                color: 'var(--sage)',
                fontSize: '13px',
              }}
            >
              Manage
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
