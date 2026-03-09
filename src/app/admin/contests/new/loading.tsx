function AdminFormSkeleton({ title, fields = 6 }: { title?: string; fields?: number }) {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>
      <div className="fade-in" style={{ marginBottom: '36px' }}>
        <div className="skel skel-t-sm" style={{ width: '120px', marginBottom: '12px' }} />
        <div className="skel skel-t-lg" style={{ width: title ? '280px' : '220px' }} />
      </div>
      <div className="g fade-in" style={{ padding: '32px 36px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i}>
              <div className="skel skel-t-sm" style={{ width: `${60 + (i % 3) * 30}px`, marginBottom: '8px' }} />
              <div className="skel" style={{ width: '100%', height: i === fields - 2 ? '120px' : '42px', borderRadius: 'var(--r)' }} />
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

export default function NewContestLoading() {
  return <AdminFormSkeleton fields={8} />;
}
