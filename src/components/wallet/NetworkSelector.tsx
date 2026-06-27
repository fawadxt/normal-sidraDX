import { useActiveChain } from '../../context/ActiveChainContext'

type Props = {
  className?: string
  compact?: boolean
}

export function NetworkSelector({ className = '', compact = false }: Props) {
  const { activeChainId, switchToChain, supportedChains, isSwitchingChain } = useActiveChain()

  return (
    <div className={`flex gap-2 ${className}`}>
      {supportedChains.map((chain) => {
        const active = chain.id === activeChainId
        return (
          <button
            key={chain.id}
            type="button"
            disabled={isSwitchingChain}
            onClick={() => void switchToChain(chain.id)}
            className={`tap-target flex-1 rounded-[14px] border px-3 py-2.5 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50 ${
              active
                ? 'border-[#D4AF37]/40 bg-[#FFF9E6] text-[#A67C00]'
                : 'border-black/[0.06] bg-[#FAFAFA] text-[#777777]'
            } ${compact ? 'py-2' : ''}`}
          >
            {chain.id === 56 ? 'BSC' : 'Sidra'}
          </button>
        )
      })}
    </div>
  )
}
