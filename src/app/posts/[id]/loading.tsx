export default function PostLoading() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

      {/* Back link + admin edit */}
      <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div className="skel skel-t-sm" style={{ width: '90px' }} />
        <div className="skel skel-btn" style={{ width: '80px', height: '32px' }} />
      </div>

      {/* Article card */}
      <div className="g fade-in" style={{ padding: '36px 40px', marginBottom: '24px' }}>
        {/* Title first */}
        <div className="skel skel-t-lg" style={{ width: '80%', height: '28px', marginBottom: '10px' }} />
        <div className="skel skel-t-lg" style={{ width: '52%', height: '28px', marginBottom: '28px' }} />
        {/* Meta row: avatar + name + date/readtime */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
          <div className="skel skel-circ" style={{ width: '32px', height: '32px', flexShrink: 0 }} />
          <div>
            <div className="skel skel-t" style={{ width: '110px', marginBottom: '6px' }} />
            <div className="skel skel-t-sm" style={{ width: '160px' }} />
          </div>
        </div>
        {/* Body lines */}
        {[95, 88, 72, 96, 80, 60, 92, 70, 84, 55].map((w, i) => (
          <div key={i} className="skel skel-t" style={{ width: `${w}%`, marginBottom: '8px', animationDelay: `${i * 0.02}s` }} />
        ))}
        {/* Vote footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
          <div className="skel skel-t-sm" style={{ width: '120px' }} />
          <div className="skel skel-btn" style={{ width: '88px', height: '32px' }} />
          <div className="skel skel-btn" style={{ width: '80px', height: '32px' }} />
        </div>
      </div>

      {/* Comments section */}
      <div className="g fade-in" style={{ padding: '28px 32px', animationDelay: '0.1s' }}>
        <div className="skel skel-t-lg" style={{ width: '140px', marginBottom: '20px' }} />
        {/* Comment input */}
        <div className="skel" style={{ height: '72px', borderRadius: 'var(--r)', marginBottom: '20px' }} />
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
