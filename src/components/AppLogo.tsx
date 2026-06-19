type Props = {
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

const sizes = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
}

export function AppLogo({ size = 'md', showName = false, className = '' }: Props) {
  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <img
        src="/logo.png"
        alt="SidraDX"
        className={`${sizes[size]} rounded-xl object-contain bg-white shrink-0`}
      />
      {showName && (
        <span className="text-sm font-extrabold tracking-wide text-slate-100 truncate">
          SidraDX
        </span>
      )}
    </div>
  )
}
