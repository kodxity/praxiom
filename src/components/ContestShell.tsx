'use client'

import { useTheme } from '@/context/ThemeContext'
import { GrainOverlay } from '@/components/GrainOverlay'
import { GridOverlay } from '@/components/GridOverlay'
import { AmbientParticles } from '@/components/AmbientParticles'

interface Props {
  slug: string
  children: React.ReactNode
}

export function ContestShell({ slug, children }: Props) {
  const theme = useTheme()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.bg,
        color: theme.textPrimary,
        position: 'relative',
      }}
    >
      {/* Doodle background - uses inline CSS pattern for jade; SVG file for others */}
      <div
        aria-hidden="true"
        style={slug === 'jade-city' ? {
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: [
            'radial-gradient(circle at 20% 30%, rgba(180,220,170,0.07) 0%, transparent 40%)',
            'radial-gradient(circle at 80% 70%, rgba(100,180,120,0.05) 0%, transparent 35%)',
            'radial-gradient(circle at 55% 55%, rgba(150,220,160,0.03) 0%, transparent 30%)',
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect x='2' y='2' width='36' height='36' fill='none' stroke='rgba(150%2C220%2C160%2C0.09)' stroke-width='0.8'/%3E%3Crect x='11' y='11' width='18' height='18' fill='none' stroke='rgba(150%2C220%2C160%2C0.06)' stroke-width='0.5'/%3E%3Cline x1='2' y1='20' x2='11' y2='20' stroke='rgba(150%2C220%2C160%2C0.05)' stroke-width='0.5'/%3E%3Cline x1='29' y1='20' x2='38' y2='20' stroke='rgba(150%2C220%2C160%2C0.05)' stroke-width='0.5'/%3E%3Cline x1='20' y1='2' x2='20' y2='11' stroke='rgba(150%2C220%2C160%2C0.05)' stroke-width='0.5'/%3E%3Cline x1='20' y1='29' x2='20' y2='38' stroke='rgba(150%2C220%2C160%2C0.05)' stroke-width='0.5'/%3E%3C/svg%3E\")",
          ].join(', '),
          backgroundSize: 'auto, auto, auto, 40px 40px',
        } : {
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `url(${theme.doodlePaths.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: theme.doodleBlend,
          opacity: theme.doodleOpacity,
        }}
      />

      {/* Overlays */}
      {theme.grainOverlay && <GrainOverlay />}
      {theme.gridOverlay && <GridOverlay />}
      <AmbientParticles color={theme.particleColor} />

      {/* Content - remap core CSS vars so inner pages (standings, problems, etc.)
          automatically use theme colors via var(--ink), var(--sage), etc. */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        ...(theme.navVariant === 'dark' ? {
          '--ink':          theme.textPrimary,
          '--ink2':         theme.textSecondary,
          '--ink3':         theme.textSecondary,
          '--ink4':         theme.textMuted,
          '--ink5':         theme.textMuted,
          '--sage':         theme.accent,
          '--sage-bg':      theme.accentBg,
          '--sage-border':  theme.accentBorder,
          '--rose':         theme.accent,
          '--glass':        theme.surface,
          '--glass-border': theme.surfaceBorder,
          '--glass-strong': theme.surface,
          '--border':       theme.surfaceBorder,
        } as React.CSSProperties : {}),
      }}>
        {children}
      </div>
    </div>
  )
}
