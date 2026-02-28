export default function BlogLoading() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

      {/* Page header */}
      <div className="fade-in" style={{ marginBottom: '40px' }}>
        <div className="skel skel-t-sm" style={{ width: '80px', marginBottom: '12px' }} />
        <div className="skel skel-t-lg" style={{ width: '280px', marginBottom: '8px' }} />
        <div className="skel skel-t" style={{ width: '48%' }} />
      </div>

      {/* Section label */}
      <div className="skel skel-t-sm" style={{ width: '100px', marginBottom: '14px' }} />

      {/* Post rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="g fade-in"
            style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '10px', animationDelay: `${i * 0.05}s` }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div className="skel skel-t-sm" style={{ width: '72px' }} />
              <div className="skel skel-t-sm" style={{ width: '52px' }} />
            </div>
            <div className="skel skel-t-lg" style={{ width: '60%' }} />
            <div className="skel skel-t" style={{ width: '85%' }} />
            <div className="skel skel-t" style={{ width: '65%' }} />
          </div>
        ))}
      </div>

    </div>
  )
}
