<<<<<<< HEAD
'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RatingGraph({ data }: { data: any[] }) {
    if (data.length < 2) return <div className="text-center text-muted-foreground py-10 flex items-center justify-center h-full border rounded border-dashed">Participate in contests to see your rating graph!</div>;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin - 50', 'dataMax + 50']}
                />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
=======
'use client';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const isStart = d.contestId === 'init' || d.contestId === 'now';

    return (
        <div style={{
            background: 'rgba(16,18,16,0.92)',
            border: '1px solid rgba(107,148,120,0.25)',
            borderRadius: '10px',
            padding: '10px 14px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(12px)',
            minWidth: '130px',
        }}>
            <div style={{
                fontFamily: 'var(--ff-display)', fontStyle: 'italic',
                fontSize: '22px', fontWeight: 700, color: '#fff', lineHeight: 1.1,
                marginBottom: '2px',
            }}>
                {d.rating}
                <span style={{ fontSize: '12px', fontWeight: 400, marginLeft: '4px', fontStyle: 'normal', opacity: 0.7 }}>Rating</span>
            </div>
            <div style={{
                fontFamily: 'var(--ff-mono)', fontSize: '9px',
                color: 'rgba(255,255,255,0.38)', letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: '6px',
            }}>
                {isStart ? 'Starting Rating' : d.date}
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomActiveDot(props: any) {
    const { cx, cy } = props;
    return (
        <g>
            <circle cx={cx} cy={cy} r={13} fill="rgba(107,148,120,0.15)" />
            <circle cx={cx} cy={cy} r={6} fill="#6b9478" />
            <circle cx={cx} cy={cy} r={3} fill="#fff" />
        </g>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RatingGraph({ data }: { data: any[] }) {
    // Ensure at least 2 points so a line is always drawn
    const displayData = data.length <= 1
        ? [...data, { ...(data[0] ?? { rating: 1200, contestId: 'now' }), date: 'Now', contestId: 'now' }]
        : data;

    const currentRating = data[data.length - 1]?.rating ?? 1200;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 10, right: 10, bottom: 0, left: -8 }}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.15}
                    vertical={false}
                    stroke="rgba(0,0,0,0.12)"
                />
                <XAxis
                    dataKey="date"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(_, i) => `G${i}`}
                    tick={{ fill: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: 10 }}
                />
                <YAxis
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin - 40', 'dataMax + 40']}
                    tick={{ fill: 'var(--ink5)', fontFamily: 'var(--ff-mono)', fontSize: 10 }}
                />
                <ReferenceLine
                    y={currentRating}
                    stroke="rgba(107,148,120,0.22)"
                    strokeDasharray="5 4"
                    label={{
                        value: currentRating,
                        position: 'right',
                        fill: 'rgba(107,148,120,0.55)',
                        fontFamily: 'var(--ff-mono)',
                        fontSize: 9,
                    }}
                />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: 'rgba(107,148,120,0.2)', strokeWidth: 1, strokeDasharray: '3 3' }}
                    isAnimationActive={false}
                />
                <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#6b9478"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#6b9478', stroke: '#6b9478', strokeWidth: 0 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    activeDot={<CustomActiveDot />}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
>>>>>>> LATESTTHISONE-NEWMODES
