export default function BlogLoading() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

      {/* Page header */}
      <div className="fade-in" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="skel skel-t-sm" style={{ width: '80px', marginBottom: '12px' }} />
          <div className="skel skel-t-lg" style={{ width: '100px', marginBottom: '8px' }} />
          <div className="skel skel-t" style={{ width: '320px' }} />
        </div>
        <div className="skel skel-btn" style={{ width: '110px' }} />
      </div>

      {/* Pinned Announcements */}
      <div style={{ marginBottom: '48px' }}>
        <div className="skel skel-t-sm" style={{ width: '120px', marginBottom: '20px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[0, 1].map((i) => (
            <div key={i} className="g fade-in" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', animationDelay: `${i * 0.04}s` }}>
              <div style={{ flex: 1 }}>
                <div className="skel skel-t-lg" style={{ width: '45%', marginBottom: '6px' }} />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div className="skel skel-t-sm" style={{ width: '70px' }} />
                  <div className="skel skel-t-sm" style={{ width: '50px' }} />
                </div>
              </div>
              <div className="skel skel-btn" style={{ width: '80px', height: '28px', flexShrink: 0 }} />
              <div className="skel skel-t-sm" style={{ width: '72px', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Community Posts */}
      <div className="skel skel-t-sm" style={{ width: '130px', marginBottom: '20px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="g fade-in"
            style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', animationDelay: `${i * 0.05}s` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div className="skel skel-circ" style={{ width: '26px', height: '26px', flexShrink: 0 }} />
              <div className="skel skel-t-sm" style={{ width: '80px' }} />
              <div className="skel skel-t-sm" style={{ width: '60px', marginLeft: 'auto' }} />
            </div>
            <div className="skel skel-t-lg" style={{ width: '80%', marginBottom: '10px' }} />
            <div className="skel skel-t" style={{ width: '100%', marginBottom: '6px' }} />
            <div className="skel skel-t" style={{ width: '90%', marginBottom: '6px' }} />
            <div className="skel skel-t" style={{ width: '65%', marginBottom: '16px', flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="skel skel-t-sm" style={{ width: '72px' }} />
                <div className="skel skel-btn" style={{ width: '72px', height: '26px' }} />
              </div>
              <div className="skel skel-t-sm" style={{ width: '46px' }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
