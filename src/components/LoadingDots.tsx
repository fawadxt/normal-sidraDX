type Props = {
  className?: string
}

export function LoadingDots({ className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-end gap-[3px] align-baseline ${className}`}
      aria-hidden="true"
    >
      <span className="loading-dot" />
      <span className="loading-dot" />
      <span className="loading-dot" />
    </span>
  )
}

export function LoadingLabel({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span>{text}</span>
      <LoadingDots />
    </span>
  )
}
