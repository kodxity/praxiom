'use client'

import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { ChevronDown, Lock } from 'lucide-react'

interface Hint {
  id: string
  text: string
  xpCost?: number
  orderIndex: number
}

interface Props {
  hints: Hint[]
  onReveal?: (hintId: string) => void
}

export function HintPanel({ hints, onReveal }: Props) {
  const theme = useTheme()
  const isDark = theme.navVariant === 'dark'
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [isOpen, setIsOpen] = useState(false)

  const sorted = [...hints].sort((a, b) => a.orderIndex - b.orderIndex)

  function revealHint(hint: Hint, index: number) {
    if (index > 0 && !revealed.has(sorted[index - 1].id)) return
    setRevealed(prev => new Set([...prev, hint.id]))
    onReveal?.(hint.id)
  }

  if (hints.length === 0) return null

  const containerStyle = isDark ? {
    background: theme.surface,
    border: `1px solid ${theme.surfaceBorder}`,
    borderRadius: 'var(--r-lg)',
    overflow: 'hidden',
  } : {
    background: 'var(--glass)',
    backdropFilter: 'blur(22px) saturate(1.5)',
    WebkitBackdropFilter: 'blur(22px) saturate(1.5)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow)',
    borderRadius: 'var(--r-lg)',
    overflow: 'hidden',
  }

  const titleColor = isDark ? theme.textMuted : 'var(--ink4)'

  return (
    <div style={containerStyle}>
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 22px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: titleColor,
        }}
      >
        <span style={{ fontFamily: 'var(--ff-ui)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: titleColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: isDark ? theme.accent : 'var(--slate)', fontSize: '13px' }}></span>
          Hints ({hints.length})
        </span>
        <ChevronDown
          size={16}
          style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: titleColor }}
        />
      </button>

      {isOpen && (
        <div className="hint-panel" style={{ paddingTop: 0 }}>
          {sorted.map((hint, i) => {
            const isRevealed = revealed.has(hint.id)
            const isLocked = i > 0 && !revealed.has(sorted[i - 1].id)

            return (
              <div
                key={hint.id}
                className={`hint-item${isRevealed ? ' revealed' : ''}`}
                onClick={() => !isLocked && !isRevealed && revealHint(hint, i)}
                style={isLocked ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                <span className="hint-num">{i + 1}</span>
                <div className="hint-content">
                  <div className="hint-title">
                    {isLocked ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Lock size={11} />
                        Locked  reveal Hint {i} first
                      </span>
                    ) : isRevealed ? `Hint ${i + 1}` : `Click to reveal Hint ${i + 1}`}
                  </div>
                  {!isLocked && (
                    <div className="hint-text">
                      {hint.text}
                    </div>
                  )}
                </div>
                {hint.xpCost !== undefined && (
                  <span className="hint-cost">{hint.xpCost} XP</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
