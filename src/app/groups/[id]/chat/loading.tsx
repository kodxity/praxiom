export default function GroupChatLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', maxWidth: '820px', margin: '0 auto', padding: '0 1.75rem' }}>

      {/* Chat header */}
      <div className="g fade-in" style={{ padding: '16px 20px', marginBottom: '12px', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="skel skel-t-sm" style={{ width: '70px' }} />
        <div className="skel skel-t" style={{ width: '1px', height: '16px' }} />
        <div className="skel skel-t-lg" style={{ width: '160px' }} />
        <div className="skel skel-btn" style={{ width: '80px', marginLeft: 'auto' }} />
      </div>

      {/* Message list */}
      <div className="g fade-in-d" style={{ flex: 1, padding: '16px 20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const isRight = i % 3 === 2;
          return (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', justifyContent: isRight ? 'flex-end' : 'flex-start', animationDelay: `${i * 0.05}s` }}>
              {!isRight && <div className="skel skel-circ" style={{ width: '30px', height: '30px', flexShrink: 0 }} />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '60%', alignItems: isRight ? 'flex-end' : 'flex-start' }}>
                {!isRight && <div className="skel skel-t-sm" style={{ width: '60px' }} />}
                <div className="skel" style={{ width: `${120 + (i % 4) * 40}px`, height: '36px', borderRadius: '10px' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div style={{ padding: '12px 0 24px' }}>
        <div className="g fade-in" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="skel" style={{ flex: 1, height: '38px', borderRadius: 'var(--r)' }} />
          <div className="skel skel-btn" style={{ width: '64px', height: '38px' }} />
        </div>
      </div>

    </div>
  );
}
