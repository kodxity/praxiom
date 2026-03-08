export default function HomeLoading() {
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>

      {/* Section A: Hero + Stats side by side */}
      <section style={{ padding: '56px 1.75rem 64px', maxWidth: '1360px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Hero card */}
          <div className="g fade-in" style={{ padding: '52px 52px', maxWidth: '820px', flex: '1 1 480px' }}>
            <div className="skel skel-t-sm" style={{ width: '240px', marginBottom: '16px' }} />
            <div className="skel skel-t-lg" style={{ width: '70%', height: '44px', marginBottom: '12px' }} />
            <div className="skel skel-t-lg" style={{ width: '50%', height: '44px', marginBottom: '28px' }} />
            <div className="skel skel-t" style={{ width: '85%', marginBottom: '8px' }} />
            <div className="skel skel-t" style={{ width: '65%', marginBottom: '36px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="skel skel-btn" style={{ width: '172px', height: '46px' }} />
              <div className="skel skel-btn" style={{ width: '148px', height: '46px' }} />
            </div>
          </div>

          {/* Stats strip (vertical) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="g fade-in-d" style={{ padding: '22px 24px', animationDelay: `${i * 0.1}s` }}>
                <div className="skel skel-t-lg" style={{ width: '52px', marginBottom: '6px' }} />
                <div className="skel skel-t-sm" style={{ width: '110px' }} />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Section B: How it works (4 feature cards) */}
      <section style={{ padding: '0 1.75rem 72px', maxWidth: '1360px', margin: '0 auto' }}>
        <div className="skel skel-t-sm" style={{ width: '80px', marginBottom: '24px' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="g fade-in" style={{ padding: '28px 28px', flex: '1 1 220px', maxWidth: '300px', animationDelay: `${0.1 + i * 0.1}s` }}>
              <div className="skel skel-circ" style={{ width: '22px', height: '22px', marginBottom: '14px' }} />
              <div className="skel skel-t-lg" style={{ width: '75%', marginBottom: '10px' }} />
              <div className="skel skel-t" style={{ width: '95%', marginBottom: '6px' }} />
              <div className="skel skel-t" style={{ width: '80%', marginBottom: '6px' }} />
              <div className="skel skel-t" style={{ width: '60%' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Section C: Announcements feed (full posts) */}
      <section style={{ padding: '0 1.75rem 80px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
          <div className="skel skel-t-sm" style={{ width: '120px' }} />
          <div className="skel skel-btn" style={{ width: '60px', height: '32px' }} />
        </div>

        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="fade-in"
            style={{
              paddingBottom: '36px',
              marginBottom: '36px',
              borderBottom: i < 2 ? '1px solid var(--glass-border)' : 'none',
              animationDelay: `${0.3 + i * 0.1}s`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div className="skel skel-circ" style={{ width: '28px', height: '28px', flexShrink: 0 }} />
              <div className="skel skel-t-sm" style={{ width: '90px' }} />
              <div className="skel skel-t-sm" style={{ width: '80px', marginLeft: 'auto' }} />
            </div>
            <div className="skel skel-t-lg" style={{ width: '62%', marginBottom: '16px' }} />
            <div className="skel skel-t" style={{ width: '98%', marginBottom: '8px' }} />
            <div className="skel skel-t" style={{ width: '90%', marginBottom: '8px' }} />
            <div className="skel skel-t" style={{ width: '74%', marginBottom: '24px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '14px', borderTop: '1px solid var(--glass-border)' }}>
              <div className="skel skel-btn" style={{ width: '80px', height: '28px' }} />
              <div className="skel skel-t-sm" style={{ width: '60px' }} />
              <div className="skel skel-t-sm" style={{ width: '90px', marginLeft: 'auto' }} />
            </div>
          </div>
        ))}
      </section>

    </div>
  )
}
