'use client'

import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface Props {
  problemId: string
  contestId?: string
  maxAttempts?: number
  onCorrect?: (answer: string) => void
}

type Verdict = 'correct' | 'wrong' | 'pending' | null

export function AnswerPanel({
  problemId,
  contestId,
  maxAttempts = 3,
  onCorrect,
}: Props) {
  const theme = useTheme()
  const isDark = theme.navVariant === 'dark'

  const [answer, setAnswer] = useState('')
  const [verdict, setVerdict] = useState<Verdict>(null)
  const [attempts, setAttempts] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const attemptsLeft = maxAttempts - attempts
  const isExhausted = attemptsLeft <= 0 && verdict !== 'correct'
  const isDisabled = loading || verdict === 'correct' || isExhausted

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || isDisabled) return

    setLoading(true)
    setVerdict('pending')
    setMessage('')

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, contestId, answer: answer.trim() }),
      })
      const data = await res.json()
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (data.correct) {
        setVerdict('correct')
        setMessage('Correct! Well done.')
        onCorrect?.(answer.trim())
      } else {
        setVerdict('wrong')
        const remaining = maxAttempts - newAttempts
        setMessage(remaining > 0
          ? `Incorrect. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
          : 'No more attempts.'
        )
      }
    } catch {
      setVerdict(null)
      setMessage('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const containerStyle = isDark ? {
    background: theme.surface,
    border: `1px solid ${theme.surfaceBorder}`,
    borderRadius: 'var(--r-lg)',
    padding: '28px',
    overflow: 'hidden',
  } : {
    background: 'var(--glass)',
    backdropFilter: 'blur(22px) saturate(1.5)',
    WebkitBackdropFilter: 'blur(22px) saturate(1.5)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow)',
    borderRadius: 'var(--r-lg)',
    padding: '28px',
    overflow: 'hidden',
  }

  const inputClass = isDark ? '' : 'input-math'
  const inputStyle: React.CSSProperties = isDark ? {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: `2px solid ${verdict === 'correct' ? theme.accent : verdict === 'wrong' ? 'var(--rose)' : theme.surfaceBorder}`,
    borderRadius: 'var(--r-lg)',
    padding: '20px 18px',
    fontFamily: 'var(--ff-mono)',
    fontSize: '24px',
    fontWeight: 300,
    color: theme.textPrimary,
    textAlign: 'center',
    letterSpacing: '0.08em',
    outline: 'none',
    transition: 'all 0.15s',
  } : {
    borderColor: verdict === 'correct' ? 'var(--sage)' : verdict === 'wrong' ? 'var(--rose)' : undefined,
    color: verdict === 'correct' ? 'var(--sage)' : verdict === 'wrong' ? 'var(--rose)' : undefined,
  }

  const titleColor = isDark ? 'rgba(255,255,255,0.45)' : 'var(--ink4)'
  const accentBgColor = isDark ? { background: `${theme.accent}25`, color: theme.textAccent, border: `1px solid ${theme.accent}40` } : { background: 'var(--sage-bg)', color: 'var(--sage)', border: '1px solid var(--sage-border)' }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <span style={{ fontFamily: 'var(--ff-ui)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', color: titleColor, textTransform: 'uppercase' }}>
          Your Answer
        </span>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '6px', ...accentBgColor }}>
          Integer
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Big answer input  matches ui.html .ans-input / .input-math */}
        <input
          type="text"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          disabled={isDisabled}
          placeholder="enter integer"
          className={inputClass}
          style={isDark ? inputStyle : { ...inputStyle, marginBottom: '12px' }}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Format hint */}
        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.3)' : 'var(--ink5)', textAlign: 'center', marginBottom: '16px', marginTop: isDark ? '12px' : '0', lineHeight: 1.6 }}>
          Enter an exact integer &middot; no spaces &middot; no commas
        </p>

        {/* Attempt pips  w-2 h-2 rounded-full flex-shrink-0 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '18px' }}>
          {Array.from({ length: maxAttempts }).map((_, i) => {
            const used = i < attempts
            const wasCorrect = verdict === 'correct' && i === attempts - 1
            return (
              <span
                key={i}
                className="attempt-pip"
                style={used
                  ? wasCorrect ? { background: isDark ? theme.accent : 'var(--sage)' } : { background: isDark ? 'rgba(184,96,78,0.7)' : 'var(--rose)' }
                  : { background: isDark ? 'rgba(255,255,255,0.15)' : undefined }
                }
              />
            )
          })}
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: isDark ? 'rgba(255,255,255,0.35)' : 'var(--ink5)', marginLeft: '6px' }}>
            {attemptsLeft > 0 ? `${attemptsLeft} of ${maxAttempts} remaining` : 'No attempts left'}
          </span>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isDisabled || !answer.trim()}
          className="btn btn-ink"
          style={{
            width: '100%',
            justifyContent: 'center',
            opacity: isDisabled || !answer.trim() ? 0.5 : 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            ...(isDark ? { background: theme.accent } : {}),
          }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Checking&hellip;</>
          ) : verdict === 'correct' ? (
            <><CheckCircle2 className="w-4 h-4" /> Solved!</>
          ) : (
            'Submit Answer'
          )}
        </button>

        {/* Verdict card */}
        {verdict && verdict !== 'pending' && message && (
          <div style={{ marginTop: '12px', padding: '14px 16px', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', gap: '10px', ...(verdict === 'correct' ? { background: isDark ? `${theme.accent}15` : 'var(--sage-bg)', color: isDark ? theme.textAccent : 'var(--sage)', border: `1px solid ${isDark ? theme.accent + '30' : 'var(--sage-border)'}` } : { background: 'var(--rose-bg)', color: 'var(--rose)', border: '1px solid var(--rose-border)' }) }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, background: verdict === 'correct' ? 'currentColor' : 'var(--rose-bg)' }}>
              {verdict === 'correct' ? <CheckCircle2 size={14} style={{ color: isDark ? theme.bg : 'white' }} /> : <XCircle size={14} />}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 500 }}>
                {verdict === 'correct' ? `Correct! Answer: ${answer}` : 'Incorrect'}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--ink4)' }}>
                {message}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
