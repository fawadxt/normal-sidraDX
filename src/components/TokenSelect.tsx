import { useEffect, useMemo, useRef, useState } from 'react'

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

function matchesSearch(token: TokenOption, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    token.symbol.toLowerCase().includes(q) ||
    (token.name?.toLowerCase().includes(q) ?? false)
  )
}

export function TokenSelect({ value, options, onChange, variant = 'pay' }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = options.find((t) => t.symbol === value) ?? options[0]

  const filteredOptions = useMemo(
    () => options.filter((token) => matchesSearch(token, search)),
    [options, search],
  )

  useEffect(() => {
    if (!open) {
      setSearch('')
      return
    }
    const id = window.setTimeout(() => searchRef.current?.focus(), 0)
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(id)
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
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-slate-700/80 bg-slate-900/98 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden">
          <div className="sticky top-0 z-10 border-b border-slate-700/80 bg-slate-900/98 p-2">
            <label className="sr-only" htmlFor={`token-search-${variant}`}>
              Search tokens
            </label>
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                ref={searchRef}
                id={`token-search-${variant}`}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or symbol"
                className="w-full rounded-lg border border-slate-600/60 bg-slate-800/90 py-2 pl-8 pr-3 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                autoComplete="off"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <ul role="listbox" className="max-h-64 overflow-y-auto py-1.5">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-4 text-center text-[11px] text-slate-500">No tokens found</li>
            ) : (
              filteredOptions.map((token) => {
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
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
