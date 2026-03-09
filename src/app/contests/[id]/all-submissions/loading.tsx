export default function AllSubmissionsLoading() {
  return (
    <div className="container" style={{ paddingTop: '36px', paddingBottom: '64px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div className="skel skel-t-sm" style={{ width: '80px', marginBottom: '8px' }} />
          <div className="skel skel-t-lg" style={{ width: '220px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="skel skel-btn" style={{ width: '100px' }} />
          <div className="skel skel-btn" style={{ width: '100px' }} />
        </div>
      </div>

      {/* Table */}
      <div className="g fade-in" style={{ overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {[40, 100, 120, 90, 60, 80].map((w, j) => (
            <div key={j} className="skel skel-t-sm" style={{ width: `${w}px`, flexShrink: 0 }} />
          ))}
        </div>

        {/* Rows */}
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{ padding: '11px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '12px', animationDelay: `${i * 0.03}s` }}>
            <div className="skel skel-btn" style={{ width: '68px', height: '22px', flexShrink: 0 }} />
            <div className="skel skel-t" style={{ width: '70px', flexShrink: 0 }} />
            <div className="skel skel-t" style={{ width: `${90 + (i % 5) * 22}px`, flex: 1 }} />
            <div className="skel skel-t-sm" style={{ width: '70px', flexShrink: 0 }} />
            <div className="skel skel-t-sm" style={{ width: '50px', flexShrink: 0 }} />
            <div className="skel skel-t-sm" style={{ width: '75px', flexShrink: 0 }} />
          </div>
        ))}
      </div>

    </div>
  );
}
