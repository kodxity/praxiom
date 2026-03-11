'use client'
import { useState, useEffect } from 'react'
import { formatDuration } from '@/lib/utils'

interface Props {
  endTime: Date
  isActive: boolean
  style?: React.CSSProperties
}

export function ContestCountdown({ endTime, isActive, style }: Props) {
  const [ms, setMs] = useState(() => Math.max(0, new Date(endTime).getTime() - Date.now()))
  useEffect(() => {
    if (!isActive) return
    const id = setInterval(() => setMs(Math.max(0, new Date(endTime).getTime() - Date.now())), 1000)
    return () => clearInterval(id)
  }, [endTime, isActive])
  if (!isActive) return <span style={style}>Ended</span>
  if (ms <= 0) return <span style={style}>Ending…</span>
  return <span style={style}>Ends in {formatDuration(ms)}</span>
}
