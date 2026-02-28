import { cn } from '@/lib/utils'

type Variant = 'sage' | 'rose' | 'amber' | 'slate' | 'violet' | 'default'

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

const variantClasses: Record<Variant, string> = {
  sage: 'badge-sage',
  rose: 'badge-rose',
  amber: 'badge-amber',
  slate: 'badge-slate',
  violet: 'badge-violet',
  default: 'badge',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('badge', variantClasses[variant], className)}>
      {children}
    </span>
  )
}
