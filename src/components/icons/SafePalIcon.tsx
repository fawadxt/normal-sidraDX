type Props = {
  className?: string
}

export function SafePalIcon({ className = 'w-7 h-7' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#4B1D7E" />
      <path
        d="M16 7c-4.2 0-7.5 3.1-7.5 7v1.2c0 2.1 1 4 2.6 5.2l-.9 4.6 4.8-2.5c.6.1 1.3.2 2 .2 4.2 0 7.5-3.1 7.5-7S20.2 7 16 7Z"
        fill="#fff"
      />
      <circle cx="12.5" cy="15" r="1.2" fill="#4B1D7E" />
      <circle cx="16" cy="15" r="1.2" fill="#4B1D7E" />
      <circle cx="19.5" cy="15" r="1.2" fill="#4B1D7E" />
    </svg>
  )
}
