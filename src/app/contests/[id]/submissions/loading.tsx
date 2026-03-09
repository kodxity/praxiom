export default function SubmissionsLoading() {
  return (
    <div className="container" style={{ paddingTop: '36px', paddingBottom: '64px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div className="skel skel-t-sm" style={{ width: '80px' }} />
        <div className="skel skel-t-sm" style={{ width: '8px' }} />
        <div className="skel skel-t-lg" style={{ width: '180px' }} />
      </div>

      {/* Submissions table */}
      <div className="g fade-in" style={{ overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {[40, 120, 90, 70, 80].map((w, j) => (
            <div key={j} className="skel skel-t-sm" style={{ width: `${w}px`, flexShrink: 0 }} />
          ))}
        </div>

        {/* Rows */}
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{ padding: '11px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '12px', animationDelay: `${i * 0.04}s` }}>
            <div className="skel skel-btn" style={{ width: '70px', height: '22px', flexShrink: 0 }} />
            <div className="skel skel-t" style={{ width: `${100 + (i % 4) * 28}px`, flex: 1 }} />
            <div className="skel skel-t-sm" style={{ width: '80px', flexShrink: 0 }} />
            <div className="skel skel-t-sm" style={{ width: '60px', flexShrink: 0 }} />
            <div className="skel skel-t-sm" style={{ width: '80px', flexShrink: 0 }} />
          </div>
        ))}
      </div>

    </div>
  );
}
