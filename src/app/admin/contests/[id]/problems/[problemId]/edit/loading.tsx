export default function EditProblemLoading() {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>
      <div className="fade-in" style={{ marginBottom: '36px' }}>
        <div className="skel skel-t-sm" style={{ width: '160px', marginBottom: '12px' }} />
        <div className="skel skel-t-lg" style={{ width: '240px' }} />
      </div>
      <div className="g fade-in" style={{ padding: '32px 36px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Title */}
          <div>
            <div className="skel skel-t-sm" style={{ width: '50px', marginBottom: '8px' }} />
            <div className="skel" style={{ width: '100%', height: '42px', borderRadius: 'var(--r)' }} />
          </div>
          {/* Points + answer row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {['Points', 'Answer'].map((_, i) => (
              <div key={i}>
                <div className="skel skel-t-sm" style={{ width: '60px', marginBottom: '8px' }} />
                <div className="skel" style={{ width: '100%', height: '42px', borderRadius: 'var(--r)' }} />
              </div>
            ))}
          </div>
          {/* Statement (large) */}
          <div>
            <div className="skel skel-t-sm" style={{ width: '80px', marginBottom: '8px' }} />
            <div className="skel" style={{ width: '100%', height: '240px', borderRadius: 'var(--r)' }} />
          </div>
          {/* Hints */}
          <div>
            <div className="skel skel-t-sm" style={{ width: '50px', marginBottom: '8px' }} />
            <div className="skel" style={{ width: '100%', height: '80px', borderRadius: 'var(--r)' }} />
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
