'use client'

import { useTheme } from '@/context/ThemeContext'
import { InlineMath, BlockMath } from 'react-katex'
import { DiffDot, DiffLabel } from '@/components/DiffDot'

interface Props {
  title: string
  lore?: string | null
  body: string         // Markdown/plain text with $...$ inline math and $$...$$ display math
  difficulty?: 1 | 2 | 3 | 4 | 5
  points?: number
  imageUrl?: string | null
  contestName?: string
  problemNumber?: number
}

/**
 * Renders a problem body, parsing $...$ as inline KaTeX and $$...$$ as block KaTeX.
 */
function renderMath(text: string) {
  // Split on $$...$$ first (block), then $...$ (inline)
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const blockIdx = remaining.indexOf('$$')
    if (blockIdx !== -1) {
      // Text before block math
      if (blockIdx > 0) {
        parts.push(...renderInlineMath(remaining.slice(0, blockIdx), key))
        key += 100
      }
      const afterOpen = remaining.slice(blockIdx + 2)
      const closeIdx = afterOpen.indexOf('$$')
      if (closeIdx !== -1) {
        const mathContent = afterOpen.slice(0, closeIdx)
        parts.push(<BlockMath key={key++} math={mathContent} />)
        remaining = afterOpen.slice(closeIdx + 2)
      } else {
        parts.push(remaining.slice(blockIdx))
        break
      }
    } else {
      parts.push(...renderInlineMath(remaining, key))
      break
    }
  }

  return parts
}

function renderInlineMath(text: string, baseKey: number): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const segments = text.split('$')
  segments.forEach((seg, i) => {
    if (i % 2 === 0) {
      // plain text - split newlines into paragraphs
      if (seg.trim()) {
        seg.split('\n\n').forEach((para, j) => {
          if (para.trim()) {
            parts.push(<p key={baseKey + i * 10 + j} style={{ marginBottom: '0.75rem' }}>{para}</p>)
          }
        })
      }
    } else {
      parts.push(<InlineMath key={baseKey + i * 10} math={seg} />)
    }
  })
  return parts
}

export function ProblemStatement({
  title,
  lore,
  body,
  difficulty,
  points,
  imageUrl,
  contestName,
  problemNumber,
}: Props) {
  const theme = useTheme()
  const isDark = theme.navVariant === 'dark'

  return (
    <div
      className="theme-card"
      style={{
        background: isDark ? theme.surface : 'rgba(255,255,255,0.72)',
        borderColor: isDark ? theme.surfaceBorder : 'rgba(0,0,0,0.08)',
        color: isDark ? theme.textPrimary : 'var(--ink)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          {contestName && problemNumber !== undefined && (
            <div
              className="text-xs mb-1 font-mono"
              style={{ color: isDark ? theme.textMuted : 'var(--ink4)' }}
            >
              {contestName} · Problem {problemNumber}
            </div>
          )}
          <h2
            style={{
              fontFamily: `var(--font-display, ${theme.displayFont})`,
              fontSize: '1.75rem',
              fontStyle: 'italic',
              color: isDark ? theme.textPrimary : 'var(--ink)',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {difficulty && <DiffLabel difficulty={difficulty} />}
          {points !== undefined && (
            <span
              className="badge"
              style={{
                background: theme.accentBg,
                color: theme.textAccent,
                border: `1px solid ${theme.accentBorder}`,
              }}
            >
              {points} pts
            </span>
          )}
        </div>
      </div>

      {/* Lore/story line */}
      {lore && (
        <div
          className="mb-6 px-4 py-3 rounded-[10px]"
          style={{
            background: theme.accentBg,
            borderLeft: `3px solid ${theme.accent}`,
            fontFamily: `var(--font-display, ${theme.displayFont})`,
            fontStyle: 'italic',
            color: isDark ? theme.textAccent : theme.accent,
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}
        >
          {lore}
        </div>
      )}

      {/* Problem body with math */}
      <div
        className="prose max-w-none"
        style={{
          color: isDark ? theme.textPrimary : 'var(--ink)',
          fontSize: '1rem',
          lineHeight: 1.75,
        }}
      >
        {renderMath(body)}
      </div>

      {/* Diagram */}
      {imageUrl && (
        <div className="mt-6 flex justify-center">
          <img
            src={imageUrl}
            alt="Problem diagram"
            className="max-w-full rounded-[10px]"
            style={{ maxHeight: '360px', objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  )
}
