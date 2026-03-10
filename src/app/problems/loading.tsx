export default function ProblemsLoading() {
  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '48px 1.75rem 80px' }}>

      {/* Header */}
      <div className="g fade-in" style={{ marginBottom: '36px', padding: '36px 40px', maxWidth: '680px' }}>
        <div className="skel skel-t-sm" style={{ width: '160px', marginBottom: '14px' }} />
        <div className="skel skel-t-lg" style={{ width: '300px', marginBottom: '8px' }} />
        <div className="skel skel-t-lg" style={{ width: '200px', marginBottom: '16px' }} />
        <div className="skel skel-t" style={{ width: '85%', marginBottom: '6px' }} />
        <div className="skel skel-t" style={{ width: '65%' }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
        {[100, 120, 80].map((w, i) => (
          <div key={i} className="g" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="skel skel-t-lg" style={{ width: '36px' }} />
            <div className="skel skel-t-sm" style={{ width: `${w}px` }} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="g fade-in-d" style={{ overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="skel skel-t-sm" style={{ width: '100%' }} />
        </div>
        {/* Problem rows */}
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{ padding: '13px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="skel skel-t-sm" style={{ width: '32px' }} />
            <div className="skel skel-circ" style={{ width: '9px', height: '9px' }} />
            <div className="skel skel-t" style={{ flex: 1, maxWidth: `${140 + (i % 4) * 35}px` }} />
            <div className="skel skel-t-sm" style={{ width: '120px' }} />
            <div className="skel skel-t-sm" style={{ width: '48px' }} />
            <div className="skel skel-t-sm" style={{ width: '52px' }} />
            <div style={{ width: '48px' }} />
          </div>
        ))}
      </div>

    </div>
  )
}
