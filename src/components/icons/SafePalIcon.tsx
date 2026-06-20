type Props = {
  className?: string
}

/** Official SafePal extension icon from safepal.com brand assets */
export function SafePalIcon({ className = 'w-7 h-7' }: Props) {
  return (
    <img
      src="/safepal-icon.svg"
      alt=""
      className={`object-contain ${className}`}
      aria-hidden="true"
      draggable={false}
    />
  )
}
