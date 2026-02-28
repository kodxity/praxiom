export default function UserProfileLoading() {
  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

      {/* Profile hero */}
      <div className="g fade-in" style={{ padding: '32px 36px', marginBottom: '20px' }}>
        {/* Top row: avatar + name */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>
          <div className="skel skel-circ" style={{ width: '64px', height: '64px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skel skel-t-lg" style={{ width: '180px', marginBottom: '8px' }} />
            <div className="skel skel-t-sm" style={{ width: '130px', marginBottom: '10px' }} />
            <div className="skel skel-btn" style={{ width: '80px' }} />
          </div>
        </div>

        {/* Stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="g" style={{ padding: '18px 20px' }}>
              <div className="skel skel-t-lg" style={{ width: '50px', marginBottom: '8px' }} />
              <div className="skel skel-t-sm" style={{ width: '70px' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>

        {/* Left: rating graph + submissions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="g" style={{ padding: '24px 28px' }}>
            <div className="skel skel-t" style={{ width: '120px', marginBottom: '20px' }} />
            <div className="skel" style={{ height: '220px', borderRadius: 'var(--r)' }} />
          </div>
          <div className="g" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="skel skel-t" style={{ width: '140px' }} />
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="skel skel-btn" style={{ width: '70px' }} />
                <div style={{ flex: 1 }}>
                  <div className="skel skel-t" style={{ width: `${120 + i * 18}px`, marginBottom: '5px' }} />
                  <div className="skel skel-t-sm" style={{ width: '60px' }} />
                </div>
                <div className="skel skel-t-sm" style={{ width: '48px' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: rank tiers + contest history */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="g" style={{ padding: '24px 28px' }}>
            <div className="skel skel-t" style={{ width: '100px', marginBottom: '16px' }} />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', marginBottom: '6px', borderRadius: 'var(--r)' }}>
                <div className="skel skel-btn" style={{ width: '72px' }} />
                <div className="skel skel-t-sm" style={{ width: '80px' }} />
              </div>
            ))}
          </div>
          <div className="g" style={{ padding: '24px 28px' }}>
            <div className="skel skel-t" style={{ width: '110px', marginBottom: '16px' }} />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="skel skel-t-sm" style={{ width: '130px' }} />
                <div className="skel skel-t-sm" style={{ width: '44px' }} />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
