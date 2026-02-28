export default function PostLoading() {
  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

      {/* Back link */}
      <div className="skel skel-t-sm fade-in" style={{ width: '80px', marginBottom: '32px' }} />

      {/* Article card */}
      <div className="g fade-in" style={{ padding: '36px 40px', marginBottom: '32px' }}>
        {/* Tags / meta row */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div className="skel skel-btn" style={{ width: '72px' }} />
          <div className="skel skel-t-sm" style={{ width: '90px' }} />
        </div>
        {/* Title */}
        <div className="skel skel-t-lg" style={{ width: '78%', marginBottom: '10px' }} />
        <div className="skel skel-t-lg" style={{ width: '54%', marginBottom: '32px' }} />
        {/* Body lines */}
        {[95, 88, 72, 96, 80, 60, 92, 70].map((w, i) => (
          <div key={i} className="skel skel-t" style={{ width: `${w}%`, marginBottom: '8px', animationDelay: `${i * 0.03}s` }} />
        ))}
        {/* Image placeholder */}
        <div className="skel" style={{ height: '220px', borderRadius: 'var(--r)', margin: '24px 0' }} />
        {[80, 65, 88].map((w, i) => (
          <div key={i} className="skel skel-t" style={{ width: `${w}%`, marginBottom: '8px', animationDelay: `${0.24 + i * 0.03}s` }} />
        ))}
      </div>

      {/* Comments section */}
      <div className="g fade-in" style={{ padding: '28px 32px', animationDelay: '0.1s' }}>
        <div className="skel skel-t-sm" style={{ width: '110px', marginBottom: '20px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', animationDelay: `${0.14 + i * 0.06}s` }}>
              <div className="skel skel-circ" style={{ width: '32px', height: '32px', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="skel skel-t-sm" style={{ width: '120px' }} />
                <div className="skel skel-t" style={{ width: '90%' }} />
                <div className="skel skel-t" style={{ width: '68%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
