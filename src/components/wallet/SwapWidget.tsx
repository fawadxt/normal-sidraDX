import { lazy, Suspense, useCallback } from 'react'
import { useWalletShell } from '../../context/WalletShellContext'
import { useActiveChain } from '../../context/ActiveChainContext'
import { sidraChain } from '../../config/sidraChain'

const SwapPanel = lazy(() =>
  import('../SwapPanel').then((m) => ({ default: m.SwapPanel })),
)

function SwapSkeleton() {
  return (
    <div className="space-y-4 rounded-[var(--premium-radius-xl)] wallet-surface-elevated p-5">
      <div className="h-10 animate-pulse rounded-full bg-[var(--premium-bg)]" />
      <div className="h-12 animate-pulse rounded-[var(--premium-radius-lg)] bg-[var(--premium-bg)]" />
      <div className="h-24 animate-pulse rounded-[var(--premium-radius-lg)] bg-[var(--premium-bg)]" />
      <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-[var(--premium-bg)]" />
      <div className="h-24 animate-pulse rounded-[var(--premium-radius-lg)] bg-[var(--premium-bg)]" />
      <div className="h-12 animate-pulse rounded-[var(--premium-radius-lg)] bg-[var(--premium-bg)]" />
    </div>
  )
}

export function SwapWidget() {
  const { isConnected, address, openConnect, isWrongChain, switchChain, isSwitchingChain } =
    useWalletShell()
  const { switchToChain } = useActiveChain()

  const handleSwitchNetwork = useCallback(() => {
    void switchToChain(sidraChain.id).catch(() => {
      switchChain({ chainId: sidraChain.id })
    })
  }, [switchChain, switchToChain])

  return (
    <Suspense fallback={<SwapSkeleton />}>
      <SwapPanel
        appearance="wallet"
        isConnected={isConnected}
        address={address}
        onConnect={openConnect}
        isWrongChain={isWrongChain}
        onSwitchNetwork={handleSwitchNetwork}
        isSwitchingNetwork={isSwitchingChain}
      />
    </Suspense>
  )
}
