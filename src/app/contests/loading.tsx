export default function ContestsLoading() {
  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '1360px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

      {/* Page header skeleton */}
      <div className="g fade-in" style={{ marginBottom: '48px', padding: '36px 40px', maxWidth: '700px' }}>
        <div className="skel skel-t-sm" style={{ width: '180px', marginBottom: '14px' }} />
        <div className="skel skel-t-lg" style={{ width: '340px', marginBottom: '8px' }} />
        <div className="skel skel-t-lg" style={{ width: '260px', marginBottom: '16px' }} />
        <div className="skel skel-t" style={{ width: '90%', marginBottom: '6px' }} />
        <div className="skel skel-t" style={{ width: '70%' }} />
      </div>

      {/* Section label */}
      <div className="skel skel-t-sm" style={{ width: '80px', marginBottom: '16px' }} />

      {/* Cards row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="g" style={{ width: '360px', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '14px', animationDelay: `${i * 0.06}s` }}>
            <div className="skel skel-btn" style={{ width: '100px' }} />
            <div className="skel skel-t-lg" style={{ width: '75%' }} />
            <div className="skel skel-t" style={{ width: '55%', marginBottom: '6px' }} />
            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
              {[0, 1, 2].map((j) => (
                <div key={j} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="skel skel-t-lg" style={{ width: '40px' }} />
                  <div className="skel skel-t-sm" style={{ width: '52px' }} />
                </div>
              ))}
            </div>
            <div className="skel" style={{ height: '42px', borderRadius: 'var(--r)', marginTop: '8px' }} />
          </div>
        ))}
      </div>

    </div>
  )
}
