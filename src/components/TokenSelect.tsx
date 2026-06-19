import { useEffect, useRef, useState } from 'react'

type TokenOption = {
  symbol: string
  name?: string
  balance?: string
}

type Props = {
  value: string
  options: TokenOption[]
  onChange: (symbol: string) => void
  variant?: 'pay' | 'receive'
}

export function TokenSelect({ value, options, onChange, variant = 'pay' }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const selected = options.find((t) => t.symbol === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const triggerClass =
    variant === 'receive'
      ? 'bg-gradient-to-br from-blue-600/20 to-cyan-600/10 border-blue-500/40 text-cyan-300 hover:border-cyan-400/60 hover:from-blue-600/30'
      : 'bg-slate-800/90 border-slate-600/60 text-slate-100 hover:border-slate-500 hover:bg-slate-800'

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 min-w-[5.5rem] px-3 py-2 rounded-xl border text-xs font-bold tracking-wide shadow-sm transition-all cursor-pointer ${triggerClass}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{selected?.symbol ?? value}</span>
        <svg
          className={`w-3.5 h-3.5 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-56 max-h-64 overflow-y-auto rounded-xl border border-slate-700/80 bg-slate-900/98 backdrop-blur-md shadow-2xl shadow-black/40 py-1.5"
        >
          {options.map((token) => {
            const isActive = token.symbol === value
            return (
              <li key={token.symbol} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(token.symbol)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2.5 transition-colors cursor-pointer flex items-start justify-between gap-2
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border-l-2 border-cyan-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-2 border-transparent'
                    }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold">{token.symbol}</span>
                    {token.name && (
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5 truncate">
                        {token.name}
                      </span>
                    )}
                  </div>
                  {token.balance !== undefined && (
                    <span
                      className={`shrink-0 text-[11px] font-mono font-bold tabular-nums ${
                        isActive ? 'text-cyan-200' : 'text-slate-400'
                      }`}
                    >
                      {token.balance}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
