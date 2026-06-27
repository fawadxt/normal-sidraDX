type Props = {
  value: number
  onChange: (pct: number) => void
  disabled?: boolean
}

const PRESETS = [0.5, 1, 2, 5] as const

export function SwapSlippagePicker({ value, onChange, disabled }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[#777777]">
        Slippage
      </span>
      <div className="flex flex-1 gap-1">
        {PRESETS.map((pct) => {
          const active = value === pct
          return (
            <button
              key={pct}
              type="button"
              disabled={disabled}
              onClick={() => onChange(pct)}
              className={`tap-target flex-1 rounded-lg border py-1.5 text-[10px] font-bold transition-all active:scale-[0.97] disabled:opacity-40 ${
                active
                  ? 'border-[#D4AF37]/40 bg-[#FFF9E6] text-[#A67C00]'
                  : 'border-black/[0.06] bg-[#FAFAFA] text-[#777777]'
              }`}
            >
              {pct}%
            </button>
          )
        })}
      </div>
    </div>
  )
}
