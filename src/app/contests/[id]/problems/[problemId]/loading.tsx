export default function ProblemLoading() {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 1.75rem 80px' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <div className="skel skel-t-sm" style={{ width: '60px' }} />
                <div className="skel skel-t-sm" style={{ width: '8px' }} />
                <div className="skel skel-t-sm" style={{ width: '120px' }} />
                <div className="skel skel-t-sm" style={{ width: '8px' }} />
                <div className="skel skel-t-sm" style={{ width: '160px' }} />
            </div>

            <div className="prob-layout">
                {/* Main panel */}
                <div className="prob-main">
                    {/* Nav dots */}
                    <div className="g-loading" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="skel" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                        ))}
                        <div className="skel skel-t-sm" style={{ width: '90px', marginLeft: '8px' }} />
                    </div>

                    {/* Problem statement */}
                    <div className="g-loading" style={{ padding: '28px 32px' }}>
                        {/* Tags */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                            <div className="skel skel-btn" style={{ width: '80px' }} />
                            <div className="skel skel-btn" style={{ width: '100px' }} />
                            <div className="skel skel-btn" style={{ width: '60px' }} />
                        </div>
                        {/* Title */}
                        <div className="skel skel-t-lg" style={{ width: '70%', height: '36px', marginBottom: '28px' }} />
                        {/* Body lines */}
                        {[1, 0.9, 1, 0.75, 1, 0.85].map((w, i) => (
                            <div key={i} className="skel skel-t" style={{ width: `${w * 100}%`, marginBottom: '10px' }} />
                        ))}
                    </div>
                </div>

                {/* Side panel */}
                <div className="prob-side">
                    <div className="g-loading" style={{ padding: '18px 20px' }}>
                        <div className="skel skel-t-sm" style={{ width: '50px', marginBottom: '10px' }} />
                        <div className="skel skel-t" style={{ width: '140px', marginBottom: '6px' }} />
                        <div className="skel skel-t-sm" style={{ width: '110px' }} />
                    </div>
                    <div className="g-loading" style={{ padding: '20px 22px' }}>
                        <div className="skel skel-t-sm" style={{ width: '60px', marginBottom: '14px' }} />
                        <div className="skel" style={{ width: '100%', height: '58px', borderRadius: 'var(--r-lg)' }} />
                    </div>
                    <div className="g-loading" style={{ padding: '18px 20px' }}>
                        <div className="skel skel-t-sm" style={{ width: '40px', marginBottom: '14px' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div className="skel skel-t-lg" style={{ width: '50px', height: '32px', margin: '0 auto 6px' }} />
                                <div className="skel skel-t-sm" style={{ width: '60px', margin: '0 auto' }} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div className="skel skel-t-lg" style={{ width: '50px', height: '32px', margin: '0 auto 6px' }} />
                                <div className="skel skel-t-sm" style={{ width: '50px', margin: '0 auto' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
