import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', className)}
      style={style}
      aria-hidden="true"
    />
  )
}

export function SkeletonProblemRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
      <Skeleton style={{ width: '8px', height: '8px', borderRadius: '50%' }} />
      <Skeleton style={{ width: '40px', height: '14px' }} />
      <Skeleton style={{ flex: 1, height: '14px' }} />
      <Skeleton style={{ width: '60px', height: '14px' }} />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <Skeleton style={{ width: '60%', height: '18px' }} />
      <Skeleton style={{ width: '40%', height: '12px' }} />
      <Skeleton style={{ width: '100%', height: '12px' }} />
      <Skeleton style={{ width: '80%', height: '12px' }} />
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Skeleton style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
        <div className="space-y-2">
          <Skeleton style={{ width: '160px', height: '24px' }} />
          <Skeleton style={{ width: '100px', height: '14px' }} />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} style={{ height: '80px' }} />
        ))}
      </div>
      <Skeleton style={{ height: '200px' }} />
    </div>
  )
}
