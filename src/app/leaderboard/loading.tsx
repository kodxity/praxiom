export default function LeaderboardLoading() {
  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

      {/* Title skeleton */}
      <div style={{ marginBottom: '32px' }}>
        <div className="skel skel-t-sm" style={{ width: '120px', marginBottom: '10px' }} />
        <div className="skel skel-t-lg" style={{ width: '260px' }} />
      </div>

      {/* Card */}
      <div className="g" style={{ overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skel skel-t" style={{ width: '140px' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="skel skel-btn" style={{ width: '72px' }} />
            <div className="skel skel-btn" style={{ width: '88px' }} />
          </div>
        </div>

        {/* Rows */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ padding: '14px 24px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="skel skel-t-sm" style={{ width: '24px' }} />
            <div className="skel skel-circ" style={{ width: '36px', height: '36px', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="skel skel-t" style={{ width: `${110 + (i % 3) * 30}px` }} />
              <div className="skel skel-t-sm" style={{ width: '80px' }} />
            </div>
            <div className="skel skel-t" style={{ width: '44px' }} />
          </div>
        ))}
      </div>

    </div>
  )
}
