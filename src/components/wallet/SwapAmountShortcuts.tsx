type Props = {
  onPick: (fraction: number) => void
  disabled?: boolean
}

const SHORTCUTS = [
  { label: '25%', fraction: 0.25 },
  { label: '50%', fraction: 0.5 },
  { label: '75%', fraction: 0.75 },
  { label: 'Max', fraction: 1 },
] as const

export function SwapAmountShortcuts({ onPick, disabled }: Props) {
  return (
    <div className="mt-2 flex gap-1.5">
      {SHORTCUTS.map(({ label, fraction }) => (
        <button
          key={label}
          type="button"
          disabled={disabled}
          onClick={() => onPick(fraction)}
          className="tap-target flex-1 rounded-lg border border-black/[0.06] bg-[#FAFAFA] py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#777777] transition-all hover:border-[#D4AF37]/35 hover:text-[#A67C00] active:scale-[0.97] disabled:opacity-40"
        >
          {label}
        </button>
      ))}
    </div>
  )
}
