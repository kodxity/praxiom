export default function NewThemeLoading() {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>
      <div className="fade-in" style={{ marginBottom: '36px' }}>
        <div className="skel skel-t-sm" style={{ width: '110px', marginBottom: '12px' }} />
        <div className="skel skel-t-lg" style={{ width: '200px' }} />
      </div>
      {/* Preview strip */}
      <div className="g fade-in" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
        <div className="skel" style={{ height: '80px', borderRadius: 0 }} />
        <div style={{ padding: '16px 20px' }}>
          <div className="skel skel-t-sm" style={{ width: '90px' }} />
        </div>
      </div>
      {/* Form fields */}
      <div className="g fade-in" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {['Slug', 'Display Name', 'Colors', 'Background', 'Typography'].map((_, i) => (
            <div key={i}>
              <div className="skel skel-t-sm" style={{ width: `${50 + i * 15}px`, marginBottom: '8px' }} />
              <div className="skel" style={{ width: '100%', height: i === 2 ? '110px' : '42px', borderRadius: 'var(--r)' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <div className="skel skel-btn" style={{ width: '120px', height: '42px' }} />
            <div className="skel skel-btn" style={{ width: '80px', height: '42px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
