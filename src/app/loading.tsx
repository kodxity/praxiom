export default function HomeLoading() {
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>

      {/* Hero skeleton */}
      <div style={{ minHeight: '58vh', display: 'flex', alignItems: 'center', padding: '5rem 0 4rem' }}>
        <div className="container fade-in">
          <div className="skel skel-t-sm" style={{ width: '140px', marginBottom: '20px' }} />
          <div className="skel skel-t-lg" style={{ width: '420px', marginBottom: '10px' }} />
          <div className="skel skel-t-lg" style={{ width: '320px', marginBottom: '24px' }} />
          <div className="skel skel-t" style={{ width: '74%', marginBottom: '6px' }} />
          <div className="skel skel-t" style={{ width: '58%', marginBottom: '32px' }} />
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="skel skel-btn" style={{ width: '160px', height: '46px' }} />
            <div className="skel skel-btn" style={{ width: '120px', height: '46px' }} />
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="container fade-in" style={{ padding: '0 1.75rem 64px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '64px' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="g" style={{ padding: '24px 32px', minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '8px', animationDelay: `${i * 0.07}s` }}>
              <div className="skel skel-t-lg" style={{ width: '52px' }} />
              <div className="skel skel-t-sm" style={{ width: '88px' }} />
            </div>
          ))}
        </div>

        {/* Announcements */}
        <div className="skel skel-t-sm" style={{ width: '120px', marginBottom: '16px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="g" style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '10px', animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="skel skel-t-sm" style={{ width: '68px' }} />
                <div className="skel skel-t-sm" style={{ width: '48px' }} />
              </div>
              <div className="skel skel-t-lg" style={{ width: '55%' }} />
              <div className="skel skel-t" style={{ width: '80%' }} />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
