'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'
import { CheckCircle2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  loreTitle?: string
  loreText?: string
  xpGained?: number
  nextProblemHref?: string
  backHref?: string
  metaNote?: string
}

export function LoreRevealModal({
  isOpen,
  onClose,
  loreTitle = 'Fragment Unlocked',
  loreText,
  xpGained = 0,
  nextProblemHref,
  backHref,
  metaNote,
}: Props) {
  const theme = useTheme()
  const [displayedXP, setDisplayedXP] = useState(0)

  // Count-up XP animation
  useEffect(() => {
    if (!isOpen) { setDisplayedXP(0); return }
    if (xpGained === 0) return
    let start = 0
    const step = Math.ceil(xpGained / 40)
    const id = setInterval(() => {
      start = Math.min(start + step, xpGained)
      setDisplayedXP(start)
      if (start >= xpGained) clearInterval(id)
    }, 20)
    return () => clearInterval(id)
  }, [isOpen, xpGained])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.60)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          zIndex: 51,
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: theme.navVariant === 'dark'
            ? `linear-gradient(135deg, ${theme.bgSecondary} 0%, ${theme.bg.split('0%')[1]?.split(')')[0] ? theme.bg : theme.bgSecondary} 100%)`
            : 'rgba(255,255,255,0.96)',
          border: `1px solid ${theme.surfaceBorder}`,
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 40px ${theme.glowColor}`,
          animation: 'modal-enter 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
          textAlign: 'center',
        }}
      >
        {/* Orb */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: `radial-gradient(circle at 40% 35%, ${theme.accent}cc, ${theme.accent}55)`,
            animation: 'orb-pulse 3s ease-in-out infinite',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>

        {/* Solved label */}
        <div
          className="badge mb-3"
          style={{
            background: theme.accentBg,
            color: theme.textAccent,
            border: `1px solid ${theme.accentBorder}`,
            display: 'inline-flex',
          }}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Solved
        </div>

        {/* Lore title */}
        <h2
          style={{
            fontFamily: `var(--font-display, ${theme.displayFont})`,
            fontSize: '1.5rem',
            fontStyle: 'italic',
            color: theme.navVariant === 'dark' ? theme.textPrimary : 'var(--ink)',
            marginBottom: '0.75rem',
            lineHeight: 1.3,
          }}
        >
          {loreTitle}
        </h2>

        {/* Lore text */}
        {loreText && (
          <p
            style={{
              color: theme.navVariant === 'dark' ? theme.textSecondary : 'var(--ink3)',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              fontStyle: 'italic',
              marginBottom: '1.5rem',
              fontFamily: `var(--font-display, ${theme.displayFont})`,
            }}
          >
            {loreText}
          </p>
        )}

        {/* XP counter */}
        {xpGained > 0 && (
          <div
            className="mb-5 px-4 py-3 rounded-[12px] inline-block"
            style={{
              background: theme.accentBg,
              border: `1px solid ${theme.accentBorder}`,
              color: theme.textAccent,
            }}
          >
            <span className="text-xs font-semibold block mb-0.5" style={{ opacity: 0.7 }}>XP GAINED</span>
            <span
              className="text-2xl font-bold mono"
              style={{ animation: 'count-up 0.8s ease-out both' }}
            >
              +{displayedXP}
            </span>
          </div>
        )}

        {/* Meta note */}
        {metaNote && (
          <p
            className="mb-5 text-xs"
            style={{
              color: theme.navVariant === 'dark' ? theme.textMuted : 'var(--ink4)',
              fontStyle: 'italic',
            }}
          >
            {metaNote}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {backHref && (
            <Link
              href={backHref}
              className="btn btn-outline flex items-center gap-1.5"
              style={{
                borderColor: theme.surfaceBorder,
                color: theme.navVariant === 'dark' ? theme.textSecondary : 'var(--ink3)',
              }}
              onClick={onClose}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Problems
            </Link>
          )}
          {nextProblemHref && (
            <Link
              href={nextProblemHref}
              className="btn flex items-center gap-1.5"
              style={{
                background: theme.accent,
                color: '#fff',
                boxShadow: `0 4px 16px ${theme.glowColor}`,
              }}
              onClick={onClose}
            >
              Next Problem
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          {!nextProblemHref && !backHref && (
            <button
              onClick={onClose}
              className="btn"
              style={{ background: theme.accent, color: '#fff' }}
            >
              Continue
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modal-enter {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
