export default function GroupLoading() {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 1.75rem 80px', position: 'relative', zIndex: 1 }}>

      {/* Breadcrumb */}
      <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
        <div className="skel skel-t-sm" style={{ width: '50px' }} />
        <div className="skel skel-t-sm" style={{ width: '8px' }} />
        <div className="skel skel-t-sm" style={{ width: '120px' }} />
      </div>

      {/* Group hero card */}
      <div className="g fade-in" style={{ padding: '28px 32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div className="skel skel-t-lg" style={{ width: '220px', height: '30px', marginBottom: '8px' }} />
            <div className="skel skel-t-sm" style={{ width: '140px' }} />
          </div>
          <div className="skel skel-btn" style={{ width: '100px', height: '36px', flexShrink: 0 }} />
        </div>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {['80px', '100px', '90px'].map((w, i) => (
            <div key={i} className="g" style={{ padding: '14px 20px', minWidth: '110px' }}>
              <div className="skel skel-t-lg" style={{ width: '44px', marginBottom: '6px' }} />
              <div className="skel skel-t-sm" style={{ width: w }} />
            </div>
          ))}
        </div>
      </div>

      {/* Member list */}
      <div className="g fade-in-d" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="skel skel-t" style={{ width: '100px' }} />
          <div className="skel skel-t-sm" style={{ width: '60px' }} />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ padding: '12px 24px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '14px', animationDelay: `${i * 0.05}s` }}>
            <div className="skel skel-t-sm" style={{ width: '20px', flexShrink: 0 }} />
            <div className="skel skel-circ" style={{ width: '34px', height: '34px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skel skel-t" style={{ width: `${100 + (i % 3) * 28}px`, marginBottom: '4px' }} />
              <div className="skel skel-btn" style={{ width: '60px', height: '18px' }} />
            </div>
            <div className="skel skel-t" style={{ width: '36px' }} />
          </div>
        ))}
      </div>

    </div>
  );
}
