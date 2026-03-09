'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { Timer } from '@/components/Timer'
import { CheckCircle2, Circle, Minus } from 'lucide-react'

interface Problem {
  id: string
  title: string
  orderIndex?: number
}

interface ProblemStatus {
  [problemId: string]: 'solved' | 'attempted' | 'current' | 'locked'
}

interface Props {
  contestId: string
  contestName: string
  problems?: Problem[]
  problemStatuses?: ProblemStatus
  endTime?: Date
}

export function ContestNav({
  contestId,
  contestName,
  problems = [],
  problemStatuses = {},
  endTime,
}: Props) {
  const theme = useTheme()
  const pathname = usePathname()

  const navStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.35)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    borderBottom: `1px solid ${theme.surfaceBorder}`,
    position: 'sticky',
    top: '64px', // below global Navbar
    zIndex: 40,
  }

  const getDotStyle = (status: string, accent: string) => {
    switch (status) {
      case 'solved':
        return { background: accent, boxShadow: `0 0 6px ${accent}` }
      case 'current':
        return { background: accent, outline: `2px solid ${accent}`, outlineOffset: '2px' }
      case 'attempted':
        return { background: '#b8853a' }
      default:
        return { background: 'rgba(255,255,255,0.18)' }
    }
  }

  return (
    <nav style={navStyle}>
      <div
        className="container mx-auto px-6 h-12 flex items-center justify-between gap-4"
        style={{ maxWidth: '1280px' }}
      >
        {/* Contest name */}
        <Link
          href={`/contests/${contestId}`}
          className="text-sm font-semibold shrink-0 opacity-90 hover:opacity-100 transition-opacity"
          style={{ color: theme.textAccent, fontFamily: `var(--font-display, ${theme.displayFont})`, fontStyle: 'italic' }}
        >
          {contestName}
        </Link>

        {/* Problem dots */}
        {problems.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto">
            {problems.map((p, i) => {
              const status = problemStatuses[p.id] ?? 'locked'
              const isCurrentProblem = pathname.includes(p.id)
              const effectiveStatus = isCurrentProblem ? 'current' : status
              const isLocked = effectiveStatus === 'locked'

              const inner = (
                <>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      display: 'inline-block',
                      transition: 'all 0.2s',
                      ...getDotStyle(effectiveStatus, theme.accent),
                    }}
                  />
                  <span
                    className="text-xs hidden sm:inline"
                    style={{
                      color: effectiveStatus === 'current' ? theme.textPrimary : theme.textMuted,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {i + 1}
                  </span>
                </>
              )

              if (isLocked) {
                return (
                  <span
                    key={p.id}
                    className="flex items-center gap-1.5 shrink-0"
                    title={i > 0 ? `Solve ${i} first to unlock` : p.title}
                    style={{ cursor: 'not-allowed', opacity: 0.45 }}
                  >
                    {inner}
                  </span>
                )
              }

              return (
                <Link
                  key={p.id}
                  href={`/contests/${contestId}/problems/${p.id}`}
                  className="flex items-center gap-1.5 shrink-0 group"
                  title={p.title}
                >
                  {inner}
                </Link>
              )
            })}
          </div>
        )}

        {/* Timer */}
        {endTime && (
          <div className="shrink-0">
            <Timer endTime={endTime} accentColor={theme.accent} />
          </div>
        )}
      </div>
    </nav>
  )
}
