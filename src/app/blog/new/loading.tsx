export default function NewBlogPostLoading() {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>
      <div className="fade-in" style={{ marginBottom: '36px' }}>
        <div className="skel skel-t-sm" style={{ width: '80px', marginBottom: '12px' }} />
        <div className="skel skel-t-lg" style={{ width: '200px' }} />
      </div>
      <div className="g fade-in" style={{ padding: '32px 36px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div>
            <div className="skel skel-t-sm" style={{ width: '50px', marginBottom: '8px' }} />
            <div className="skel" style={{ width: '100%', height: '42px', borderRadius: 'var(--r)' }} />
          </div>
          <div>
            <div className="skel skel-t-sm" style={{ width: '50px', marginBottom: '8px' }} />
            <div className="skel" style={{ width: '100%', height: '280px', borderRadius: 'var(--r)' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <div className="skel skel-btn" style={{ width: '120px', height: '42px' }} />
            <div className="skel skel-btn" style={{ width: '80px', height: '42px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
