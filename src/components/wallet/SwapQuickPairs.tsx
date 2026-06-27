import { TokenIcon } from './TokenIcon'

export type SwapPairPreset = {
  from: string
  to: string
  label: string
}

export const POPULAR_SWAP_PAIRS: SwapPairPreset[] = [
  { from: 'SDA', to: 'WSDA', label: 'Wrap' },
  { from: 'WSDA', to: 'SDA', label: 'Unwrap' },
  { from: 'SDA', to: 'ECSDA', label: 'ECSDA' },
  { from: 'SDA', to: 'VPD', label: 'VPD' },
  { from: 'SDA', to: 'MBF', label: 'MBF' },
]

type Props = {
  activeFrom: string
  activeTo: string
  onSelect: (from: string, to: string) => void
  disabled?: boolean
}

export function SwapQuickPairs({ activeFrom, activeTo, onSelect, disabled }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {POPULAR_SWAP_PAIRS.map((pair) => {
        const active = pair.from === activeFrom && pair.to === activeTo
        return (
          <button
            key={`${pair.from}-${pair.to}`}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(pair.from, pair.to)}
            className={`tap-target flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all active:scale-[0.97] disabled:opacity-40 ${
              active
                ? 'border-[#D4AF37]/45 bg-[#FFF9E6] text-[#A67C00]'
                : 'border-black/[0.06] bg-white text-[#555555] shadow-sm'
            }`}
          >
            <TokenIcon symbol={pair.from} size={18} className="!h-[18px] !w-[18px] !rounded-md" />
            <span className="text-[#999999]">→</span>
            <TokenIcon symbol={pair.to} size={18} className="!h-[18px] !w-[18px] !rounded-md" />
            <span>{pair.label}</span>
          </button>
        )
      })}
    </div>
  )
}
