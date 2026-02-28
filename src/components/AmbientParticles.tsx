'use client'

import { useEffect, useRef } from 'react'

interface Props {
  color: string
  count?: number
}

export function AmbientParticles({ color, count = 18 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create particles
    const particles: HTMLDivElement[] = []
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div')
      const size = 3 + Math.random() * 5
      const x = Math.random() * 100
      const delay = Math.random() * 8
      const duration = 5 + Math.random() * 7

      p.style.cssText = `
        position: absolute;
        left: ${x}%;
        bottom: -10px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        animation: float-up ${duration}s ease-in-out ${delay}s infinite;
        pointer-events: none;
      `
      container.appendChild(p)
      particles.push(p)
    }

    return () => {
      particles.forEach(p => p.remove())
    }
  }, [color, count])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  )
}
