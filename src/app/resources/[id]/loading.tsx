export default function ResourceLoading() {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 1.75rem 80px', position: 'relative', zIndex: 1 }}>

      {/* Back link + edit button */}
      <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div className="skel skel-t-sm" style={{ width: '110px' }} />
        <div className="skel skel-btn" style={{ width: '80px', height: '32px' }} />
      </div>

      {/* Article card */}
      <div className="g fade-in" style={{ padding: '36px 40px' }}>
        {/* Visibility badge */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div className="skel skel-btn" style={{ width: '70px', height: '22px' }} />
        </div>
        {/* Title */}
        <div className="skel skel-t-lg" style={{ width: '75%', height: '30px', marginBottom: '10px' }} />
        <div className="skel skel-t-lg" style={{ width: '48%', height: '30px', marginBottom: '28px' }} />
        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
          <div className="skel skel-circ" style={{ width: '30px', height: '30px', flexShrink: 0 }} />
          <div>
            <div className="skel skel-t" style={{ width: '100px', marginBottom: '5px' }} />
            <div className="skel skel-t-sm" style={{ width: '140px' }} />
          </div>
        </div>
        {/* Content lines */}
        {[98, 90, 76, 95, 82, 60, 88, 73, 92, 55, 85, 70].map((w, i) => (
          <div key={i} className="skel skel-t" style={{ width: `${w}%`, marginBottom: '9px', animationDelay: `${i * 0.02}s` }} />
        ))}
      </div>

    </div>
  );
}
