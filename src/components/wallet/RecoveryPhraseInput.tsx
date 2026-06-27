import { useCallback, useEffect, useMemo, useState } from 'react'
import { EyeIcon, EyeOffIcon } from './WalletIcons'

const WORD_COUNT = 12

type Props = {
  value: string
  onChange: (phrase: string) => void
  disabled?: boolean
}

function splitWords(value: string): string[] {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  return Array.from({ length: WORD_COUNT }, (_, i) => parts[i] ?? '')
}

export function RecoveryPhraseInput({ value, onChange, disabled }: Props) {
  const [words, setWords] = useState(() => splitWords(value))
  const [hidden, setHidden] = useState<Record<number, boolean>>({})

  useEffect(() => {
    setWords(splitWords(value))
  }, [value])

  const emit = useCallback(
    (next: string[]) => {
      const phrase = next.map((w) => w.trim()).filter(Boolean).join(' ')
      onChange(phrase)
    },
    [onChange],
  )

  const updateWord = (index: number, word: string) => {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, '')
    const next = [...words]
    next[index] = cleaned
    setWords(next)
    emit(next)
  }

  const handlePaste = (index: number, text: string) => {
    const parts = text.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (parts.length <= 1) {
      updateWord(index, parts[0] ?? '')
      return
    }
    const next = [...words]
    parts.forEach((part, offset) => {
      const target = index + offset
      if (target < WORD_COUNT) next[target] = part.replace(/[^a-z]/g, '')
    })
    setWords(next)
    emit(next)
  }

  const toggleWord = (index: number) => {
    setHidden((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const allHidden = useMemo(
    () => words.some((w) => w) && words.every((w, i) => !w || hidden[i]),
    [hidden, words],
  )

  const toggleAll = () => {
    const next = !allHidden
    setHidden(Object.fromEntries(words.map((_, i) => [i, next])))
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A67C00]">
          Enter 12 words
        </p>
        <button
          type="button"
          onClick={toggleAll}
          disabled={disabled}
          className="tap-target flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-[#FFF9E6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#A67C00] disabled:opacity-40"
        >
          {allHidden ? <EyeIcon className="h-3.5 w-3.5" /> : <EyeOffIcon className="h-3.5 w-3.5" />}
          {allHidden ? 'Show all' : 'Hide all'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {words.map((word, index) => {
          const isHidden = hidden[index] ?? false
          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-[16px] border border-black/[0.06] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center gap-2 px-3 py-2.5 pr-9">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FFF9E6] text-[10px] font-bold tabular-nums text-[#A67C00]">
                  {index + 1}
                </span>
                <input
                  type={isHidden ? 'password' : 'text'}
                  value={word}
                  disabled={disabled}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  onChange={(e) => updateWord(index, e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault()
                    handlePaste(index, e.clipboardData.getData('text'))
                  }}
                  placeholder={`Word ${index + 1}`}
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#111111] outline-none placeholder:font-normal placeholder:text-[#CCCCCC]"
                />
              </div>
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggleWord(index)}
                className="tap-target absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#777777] hover:bg-[#FAFAFA] hover:text-[#A67C00] disabled:opacity-40"
                aria-label={isHidden ? `Show word ${index + 1}` : `Hide word ${index + 1}`}
              >
                {isHidden ? (
                  <EyeIcon className="h-4 w-4" stroke="currentColor" />
                ) : (
                  <EyeOffIcon className="h-4 w-4" stroke="currentColor" />
                )}
              </button>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-center text-[10px] text-[#999999]">
        Paste full phrase into any box — all words fill automatically.
      </p>
    </div>
  )
}
