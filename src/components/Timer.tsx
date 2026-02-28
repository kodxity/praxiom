'use client'

import { useState, useEffect } from 'react'

interface Props {
  endTime: Date
  accentColor?: string
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function Timer({ endTime, accentColor = '#6b9478' }: Props) {
  const [remaining, setRemaining] = useState(() => Math.max(0, endTime.getTime() - Date.now()))

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, endTime.getTime() - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endTime])

  const totalSecs = Math.floor(remaining / 1000)
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60

  const isLow = remaining < 5 * 60 * 1000   // < 5 min
  const isCritical = remaining < 60 * 1000  // < 1 min
  const isOver = remaining === 0

  const color = isOver
    ? '#8a8274'
    : isLow
    ? '#b8604e'
    : accentColor

  return (
    <div
      className="flex items-center gap-0.5"
      style={{
        fontFamily: 'var(--font-mono)',
        fontVariantNumeric: 'tabular-nums',
        fontSize: '0.8rem',
        color,
        animation: isCritical && !isOver ? 'timer-flash 1s ease-in-out infinite' : undefined,
      }}
    >
      {h > 0 && (
        <>
          <span style={{ minWidth: '20px', textAlign: 'center' }}>{pad(h)}</span>
          <span style={{ opacity: 0.5 }}>:</span>
        </>
      )}
      <span style={{ minWidth: '20px', textAlign: 'center' }}>{pad(m)}</span>
      <span style={{ opacity: 0.5 }}>:</span>
      <span style={{ minWidth: '20px', textAlign: 'center' }}>{pad(s)}</span>
      {isOver && <span style={{ marginLeft: '4px', opacity: 0.6, fontSize: '0.7rem' }}>ended</span>}
    </div>
  )
}
