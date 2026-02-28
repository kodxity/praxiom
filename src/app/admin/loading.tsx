export default function AdminLoading() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

      {/* Page header */}
      <div className="fade-in" style={{ marginBottom: '40px' }}>
        <div className="skel skel-t-sm" style={{ width: '140px', marginBottom: '12px' }} />
        <div className="skel skel-t-lg" style={{ width: '260px' }} />
      </div>

      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {[0, 1].map((i) => (
          <div key={i} className="g fade-in" style={{ padding: '28px 32px', animationDelay: `${i * 0.07}s` }}>
            <div className="skel skel-t-sm" style={{ width: '130px', marginBottom: '20px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <div className="skel" style={{ height: '38px', borderRadius: 'var(--r)' }} />
              <div className="skel" style={{ height: '38px', borderRadius: 'var(--r)' }} />
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[0, 1, 2].map((j) => (
                <div key={j} className="skel skel-btn" style={{ width: '80px' }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Manage contests card */}
      <div className="g fade-in" style={{ padding: '28px 32px', animationDelay: '0.14s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div className="skel skel-t-sm" style={{ width: '150px' }} />
          <div className="skel skel-t-sm" style={{ width: '40px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <div style={{ display: 'flex', gap: '12px', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
            {[160, 80, 70, 90].map((w, j) => (
              <div key={j} className="skel skel-t-sm" style={{ width: `${w}px` }} />
            ))}
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border)', animationDelay: `${0.18 + i * 0.05}s` }}>
              <div className="skel skel-t" style={{ width: '40%' }} />
              <div className="skel skel-btn" style={{ width: '60px' }} />
              <div className="skel skel-t-sm" style={{ width: '70px' }} />
              <div className="skel skel-t-sm" style={{ width: '90px' }} />
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <div className="skel skel-t-sm" style={{ width: '32px' }} />
                <div className="skel skel-t-sm" style={{ width: '28px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
