export default function ResourcesLoading() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 1.75rem 80px', position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <div className="fade-in" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="skel skel-t-sm" style={{ width: '80px', marginBottom: '12px' }} />
          <div className="skel skel-t-lg" style={{ width: '200px', marginBottom: '8px' }} />
          <div className="skel skel-t" style={{ width: '340px' }} />
        </div>
        <div className="skel skel-btn" style={{ width: '140px' }} />
      </div>

      {/* Resource cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="g fade-in"
            style={{ padding: '22px 28px', display: 'flex', alignItems: 'flex-start', gap: '16px', animationDelay: `${i * 0.06}s` }}
          >
            {/* Icon */}
            <div className="skel skel-circ" style={{ width: '36px', height: '36px', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <div className="skel skel-t-lg" style={{ width: `${180 + (i % 3) * 60}px` }} />
                <div className="skel skel-btn" style={{ width: '70px', height: '20px' }} />
              </div>
              {/* Preview lines */}
              <div className="skel skel-t" style={{ width: '95%', marginBottom: '5px' }} />
              <div className="skel skel-t" style={{ width: `${65 + (i % 4) * 8}%` }} />
              {/* Meta */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <div className="skel skel-t-sm" style={{ width: '80px' }} />
                <div className="skel skel-t-sm" style={{ width: '60px' }} />
              </div>
            </div>
            <div className="skel skel-btn" style={{ width: '80px', flexShrink: 0 }} />
          </div>
        ))}
      </div>

    </div>
  );
}
