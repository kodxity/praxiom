export default function AdminThemesLoading() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

      {/* Header */}
      <div className="fade-in" style={{ marginBottom: '40px' }}>
        <div className="skel skel-t-sm" style={{ width: '120px', marginBottom: '12px' }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div className="skel skel-t-lg" style={{ width: '200px' }} />
          <div className="skel skel-btn" style={{ width: '110px' }} />
        </div>
      </div>

      {/* Built-in presets section */}
      <div style={{ marginBottom: '40px' }}>
        <div className="skel skel-t-sm" style={{ width: '140px', marginBottom: '18px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="fade-in" style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', animationDelay: `${i * 0.05}s` }}>
              <div className="skel" style={{ height: '52px', borderRadius: 0 }} />
              <div style={{ padding: '10px 12px' }}>
                <div className="skel skel-t" style={{ width: '80%', marginBottom: '5px' }} />
                <div className="skel skel-t-sm" style={{ width: '55%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom themes section */}
      <div>
        <div className="skel skel-t-sm" style={{ width: '130px', marginBottom: '18px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="fade-in-d" style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', animationDelay: `${i * 0.06}s` }}>
              <div className="skel" style={{ height: '52px', borderRadius: 0 }} />
              <div style={{ padding: '10px 12px' }}>
                <div className="skel skel-t" style={{ width: '70%', marginBottom: '5px' }} />
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <div className="skel skel-btn" style={{ width: '52px', height: '24px' }} />
                  <div className="skel skel-btn" style={{ width: '52px', height: '24px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
