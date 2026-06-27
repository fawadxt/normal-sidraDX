import { SwapWidget } from './SwapWidget'
import { useWalletSettings } from '../../hooks/useWalletSettings'
import { useWalletShell } from '../../context/WalletShellContext'
import { sidraChain } from '../../config/sidraChain'

type Props = {
  showTitle?: boolean
  showFooter?: boolean
  className?: string
}

export function SwapSection({ showTitle = true, showFooter = true, className = '' }: Props) {
  const { isConnected, isWrongChain } = useWalletShell()
  const { settings } = useWalletSettings()

  return (
    <section id="home-swap" className={`wallet-page-gutter scroll-mt-24 ${className}`}>
      {showTitle && (
        <div className="mb-3">
          <h2 className="text-base font-semibold text-[var(--premium-text)]">Swap</h2>
          <p className="mt-0.5 text-[11px] text-[var(--premium-text-muted)]">
            SidraDX pool · Live quotes · {settings.defaultSlippage}% slippage
          </p>
        </div>
      )}

      {!isConnected && (
        <p className="mb-3 text-center text-xs text-[var(--premium-text-muted)]">
          Connect your wallet to swap on Sidra Chain
        </p>
      )}

      {isConnected && isWrongChain && (
        <div className="swap-alert mb-3 leading-relaxed">
          Switch to <strong>{sidraChain.name}</strong> (Chain ID {sidraChain.id}) to swap.
        </div>
      )}

      <SwapWidget />

      {showFooter && (
        <p className="mt-3 px-1 text-center text-[10px] leading-relaxed text-[var(--premium-text-muted)]">
          Quotes refresh every 20s · Platform fee paid in SDA
        </p>
      )}
    </section>
  )
}
