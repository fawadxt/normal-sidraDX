type Props = {
  className?: string
}

/** Official SafePal blue brand mark (#4A21EF) from safepal.com logo-dark.svg */
export function SafePalIcon({ className = 'w-7 h-7' }: Props) {
  return (
    <img
      src="/safepal-blue-logo.svg"
      alt=""
      className={`object-contain ${className}`}
      aria-hidden="true"
      draggable={false}
    />
  )
}
