import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Praxis — Math Contest Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(135deg, #eeeae3 0%, #e0dbd0 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Georgia, serif',
                    position: 'relative',
                }}
            >
                {/* Subtle grid pattern */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage:
                            'linear-gradient(rgba(107,148,120,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(107,148,120,0.08) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
                {/* Accent dot */}
                <div
                    style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#6b9478',
                        marginBottom: 32,
                    }}
                />
                {/* Wordmark */}
                <div
                    style={{
                        fontSize: 96,
                        fontWeight: 400,
                        color: '#18160f',
                        letterSpacing: '-3px',
                        lineHeight: 1,
                        marginBottom: 20,
                    }}
                >
                    Praxis
                </div>
                {/* Tagline */}
                <div
                    style={{
                        fontSize: 28,
                        color: '#3a3830',
                        letterSpacing: '0.02em',
                        marginBottom: 48,
                    }}
                >
                    Math Contest Platform
                </div>
                {/* Pills */}
                <div style={{ display: 'flex', gap: 16 }}>
                    {['Compete', 'Solve', 'Climb'].map((word) => (
                        <div
                            key={word}
                            style={{
                                background: 'rgba(107,148,120,0.12)',
                                border: '1px solid rgba(107,148,120,0.28)',
                                borderRadius: 24,
                                padding: '8px 24px',
                                fontSize: 20,
                                color: '#4a7a5a',
                                letterSpacing: '0.05em',
                            }}
                        >
                            {word}
                        </div>
                    ))}
                </div>
            </div>
        ),
        { ...size },
    );
}
