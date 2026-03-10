export default function ContestLoading() {
    return (
        <div>
            {/* Hero skeleton */}
            <div className="contest-loading-hero">
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, transparent 60%, rgba(255,255,255,0.08) 100%)',
                    }}
                />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    {/* Status badge */}
                    <div className="skel skel-btn" style={{ width: '70px', marginBottom: '20px' }} />
                    {/* Title */}
                    <div className="skel skel-t-lg" style={{ width: '420px', maxWidth: '80%', height: '44px', marginBottom: '12px' }} />
                    <div className="skel skel-t-lg" style={{ width: '260px', maxWidth: '60%', height: '44px', marginBottom: '24px' }} />
                    {/* Description */}
                    <div className="skel skel-t" style={{ width: '380px', maxWidth: '70%', marginBottom: '8px' }} />
                    <div className="skel skel-t" style={{ width: '300px', maxWidth: '60%', marginBottom: '32px' }} />
                    {/* Metadata */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
                        {[100, 80, 90, 110].map((w, i) => (
                            <div key={i} className="skel skel-t-sm" style={{ width: `${w}px` }} />
                        ))}
                    </div>
                    {/* Button */}
                    <div className="skel skel-btn" style={{ width: '160px', height: '44px' }} />
                </div>
            </div>

            {/* Body skeleton */}
            <div className="container" style={{ paddingTop: '36px', paddingBottom: '64px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {/* Section heading */}
                <div className="skel skel-t" style={{ width: '120px', marginBottom: '4px' }} />

                {/* Problem rows */}
                <div className="contest-loading-body-card">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '28px 20px 1fr auto',
                                gap: '12px',
                                alignItems: 'center',
                                padding: '14px 20px',
                                borderBottom: '1px solid rgba(0,0,0,0.04)',
                            }}
                        >
                            <div className="skel skel-t-sm" style={{ width: '20px' }} />
                            <div className="skel skel-circ" style={{ width: '9px', height: '9px', borderRadius: '50%' }} />
                            <div className="skel skel-t" style={{ width: `${120 + i * 40}px`, maxWidth: '80%' }} />
                            <div className="skel skel-btn" style={{ width: '60px' }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
