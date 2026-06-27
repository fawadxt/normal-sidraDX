import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { EyeIcon, EyeOffIcon } from './WalletIcons'

type Props = {
  phrase: string
  className?: string
  /** Start with all words hidden (SafePal-style privacy) */
  defaultHidden?: boolean
}

export function RecoveryPhraseGrid({ phrase, className = '', defaultHidden = true }: Props) {
  const words = useMemo(
    () => phrase.trim().split(/\s+/).filter(Boolean),
    [phrase],
  )

  const [hidden, setHidden] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(words.map((_, i) => [i, defaultHidden])),
  )

  const allHidden = words.length > 0 && words.every((_, i) => hidden[i])

  const toggleWord = useCallback((index: number) => {
    setHidden((prev) => ({ ...prev, [index]: !prev[index] }))
  }, [])

  const toggleAll = useCallback(() => {
    const next = !allHidden
    setHidden(Object.fromEntries(words.map((_, i) => [i, next])))
  }, [allHidden, words])

  if (words.length === 0) {
    return (
      <div className={`rounded-[20px] border border-black/[0.06] bg-[#FAFAFA] p-6 text-center text-sm text-[#777777] ${className}`}>
        Generating phrase…
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A67C00]">
          Recovery phrase
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="tap-target flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-[#FFF9E6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#A67C00]"
        >
          {allHidden ? <EyeIcon className="h-3.5 w-3.5" /> : <EyeOffIcon className="h-3.5 w-3.5" />}
          {allHidden ? 'Show all' : 'Hide all'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {words.map((word, index) => {
          const isHidden = hidden[index] ?? defaultHidden
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.25 }}
              className="relative overflow-hidden rounded-[16px] border border-black/[0.06] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center gap-2 px-3 py-3 pr-9">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FFF9E6] text-[10px] font-bold tabular-nums text-[#A67C00]">
                  {index + 1}
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-sm font-semibold tracking-tight ${
                    isHidden ? 'text-transparent select-none' : 'text-[#111111]'
                  }`}
                  style={isHidden ? { textShadow: '0 0 12px rgba(17,17,17,0.55)' } : undefined}
                  aria-hidden={isHidden}
                >
                  {isHidden ? '••••••' : word}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleWord(index)}
                className="tap-target absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#777777] transition-colors hover:bg-[#FAFAFA] hover:text-[#A67C00]"
                aria-label={isHidden ? `Show word ${index + 1}` : `Hide word ${index + 1}`}
              >
                {isHidden ? (
                  <EyeIcon className="h-4 w-4" stroke="currentColor" />
                ) : (
                  <EyeOffIcon className="h-4 w-4" stroke="currentColor" />
                )}
              </button>
            </motion.div>
          )
        })}
      </div>

      <p className="mt-3 text-center text-[10px] leading-relaxed text-[#999999]">
        Tap the eye on each word to reveal or hide. Never share your phrase with anyone.
      </p>
    </div>
  )
}
