interface Props {
  difficulty: 1 | 2 | 3 | 4 | 5
  size?: number
}

const diffColors: Record<number, string> = {
  1: '#6b9478',
  2: '#8ec49e',
  3: '#b8853a',
  4: '#b8604e',
  5: '#7b6aab',
}

const diffLabels: Record<number, string> = {
  1: 'Easy',
  2: 'Easy-Med',
  3: 'Medium',
  4: 'Hard',
  5: 'Expert',
}

export function DiffDot({ difficulty, size = 8 }: Props) {
  const color = diffColors[difficulty] ?? '#8a8274'
  const label = diffLabels[difficulty] ?? 'Unknown'
  return (
    <span
      className="inline-block flex-shrink-0 rounded-full"
      style={{ width: size, height: size, background: color }}
      title={label}
      aria-label={label}
    />
  )
}

export function DiffLabel({ difficulty }: { difficulty: 1 | 2 | 3 | 4 | 5 }) {
  const color = diffColors[difficulty] ?? '#8a8274'
  const label = diffLabels[difficulty] ?? 'Unknown'
  return (
    <span
      className="badge"
      style={{
        background: `${color}18`,
        color,
        border: `1px solid ${color}38`,
      }}
    >
      {label}
    </span>
  )
}
