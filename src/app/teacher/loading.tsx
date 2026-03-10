export default function TeacherLoading() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>
      <div className="fade-in" style={{ marginBottom: '36px' }}>
        <div className="skel skel-t-sm" style={{ width: '140px', marginBottom: '12px' }} />
        <div className="skel skel-t-lg" style={{ width: '240px' }} />
      </div>
      <div className="skel" style={{ width: '280px', height: '40px', borderRadius: '10px', marginBottom: '24px' }} />
      <div className="g fade-in" style={{ padding: '24px 28px' }}>
        <div className="skel skel-t-sm" style={{ width: '180px', marginBottom: '16px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="skel" style={{ height: '80px', borderRadius: 'var(--r)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
