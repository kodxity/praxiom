'use client'

export function GridOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        backgroundImage: 'radial-gradient(circle, rgba(100,180,255,0.20) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    />
  )
}
