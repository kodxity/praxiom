export default function StandingsLoading() {
  return (
    <div className="container" style={{ paddingTop: '36px', paddingBottom: '64px' }}>

      {/* Page title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div className="skel skel-t-sm" style={{ width: '60px', marginBottom: '8px' }} />
          <div className="skel skel-t-lg" style={{ width: '180px' }} />
        </div>
        <div className="skel skel-btn" style={{ width: '90px' }} />
      </div>

      {/* Standings table */}
      <div className="g fade-in" style={{ overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="skel skel-t-sm" style={{ width: '24px', flexShrink: 0 }} />
          <div className="skel skel-t-sm" style={{ width: '110px', flex: 1 }} />
          <div className="skel skel-t-sm" style={{ width: '44px' }} />
          {[1, 2, 3, 4, 5].map((j) => (
            <div key={j} className="skel skel-t-sm" style={{ width: '28px' }} />
          ))}
          <div className="skel skel-t-sm" style={{ width: '50px' }} />
        </div>

        {/* Contestant rows */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '10px', animationDelay: `${i * 0.04}s` }}>
            <div className="skel skel-t-sm" style={{ width: '20px', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="skel skel-circ" style={{ width: '26px', height: '26px', flexShrink: 0 }} />
              <div className="skel skel-t" style={{ width: `${80 + (i % 4) * 24}px` }} />
            </div>
            <div className="skel skel-t" style={{ width: '36px' }} />
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="skel" style={{ width: '28px', height: '24px', borderRadius: '6px' }} />
            ))}
            <div className="skel skel-t-sm" style={{ width: '44px' }} />
          </div>
        ))}
      </div>

    </div>
  );
}
