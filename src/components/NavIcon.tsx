type Props = {
  name: 'assets' | 'send' | 'receive'
  active?: boolean
}

export function NavIcon({ name, active = false }: Props) {
  const className = `w-[22px] h-[22px] ${active ? 'text-cyan-400' : 'text-slate-500'}`

  if (name === 'assets') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 8.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 10.5h16"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M16 5H8a2 2 0 0 0-2 2v1.5h12V7a2 2 0 0 0-2-2Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <circle cx="16.5" cy="14.5" r="1.25" fill="currentColor" />
      </svg>
    )
  }

  if (name === 'send') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M7 17L17 7"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M9 7h8v8"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M15 17H7V9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
