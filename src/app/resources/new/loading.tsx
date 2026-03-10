export default function ResourceNewLoading() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 1.75rem 80px', position: 'relative', zIndex: 1 }}>
      <div className="fade-in" style={{ marginBottom: '36px' }}>
        <div className="skel skel-t-sm" style={{ width: '90px', marginBottom: '12px' }} />
        <div className="skel skel-t-lg" style={{ width: '220px' }} />
      </div>
      <div className="g fade-in" style={{ padding: '32px 36px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[140, 200, '100%'].map((w, i) => (
            <div key={i}>
              <div className="skel skel-t-sm" style={{ width: '80px', marginBottom: '8px' }} />
              <div className="skel" style={{ width: typeof w === 'number' ? `${w}px` : w, height: i === 2 ? '180px' : '42px', borderRadius: 'var(--r)' }} />
            </div>
          ))}
          <div className="skel" style={{ width: '120px', height: '42px', borderRadius: 'var(--r)', marginTop: '8px' }} />
        </div>
      </div>
    </div>
  );
}
