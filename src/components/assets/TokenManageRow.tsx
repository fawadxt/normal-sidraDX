import { motion } from 'framer-motion'
import { displayTokenName } from '../../lib/assetFilters'
import { TokenIcon } from '../wallet/TokenIcon'

export type ManagedTokenRow = {
  symbol: string
  name: string
  displayLabel: string
  amount: number
  visible: boolean
}

type Props = {
  token: ManagedTokenRow
  dragHandle?: boolean
  onToggle: (visible: boolean) => void
}

export function TokenManageRow({ token, dragHandle, onToggle }: Props) {
  const label = token.displayLabel || displayTokenName(token.symbol, token.name)

  return (
    <div className="flex items-center gap-3 border-b border-black/[0.04] px-4 py-3.5 last:border-b-0">
      {dragHandle && (
        <span
          className="flex shrink-0 cursor-grab touch-none flex-col gap-0.5 px-1 text-[#C9A227] active:cursor-grabbing"
          aria-hidden
        >
          <span className="h-0.5 w-3.5 rounded-full bg-current" />
          <span className="h-0.5 w-3.5 rounded-full bg-current" />
          <span className="h-0.5 w-3.5 rounded-full bg-current" />
        </span>
      )}

      <TokenIcon symbol={token.symbol} size={40} className="rounded-xl" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#111111]">{label}</p>
        <p className="truncate text-xs text-[#777777]">
          {token.amount > 0
            ? `${token.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${token.symbol}`
            : token.name}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={token.visible}
        aria-label={`${label} visibility`}
        onClick={() => onToggle(!token.visible)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          token.visible ? 'bg-[#D4AF37]' : 'bg-[#E8E8E8]'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 520, damping: 32 }}
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm ${
            token.visible ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}

export function SettingsSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-[#D4AF37]' : 'bg-[#E8E8E8]'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 520, damping: 32 }}
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}
