import { BRAND } from '../config/brand'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

const sizes = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
}

export function AppLogo({ size = 'md', showName = false, className = '' }: Props) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <img
        src={BRAND.iconPath}
        alt={BRAND.name}
        className={`${sizes[size]} shrink-0 rounded-[22%] object-cover shadow-[var(--premium-shadow-xs)]`}
      />
      {showName && (
        <span className="truncate text-sm font-bold tracking-tight text-[var(--premium-text)]">
          {BRAND.name}
        </span>
      )}
    </div>
  )
}
