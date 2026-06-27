import { motion } from 'framer-motion'
import type { PortfolioAsset } from '../../hooks/usePortfolio'
import { useWalletShell } from '../../context/WalletShellContext'
import { TokenIcon } from './TokenIcon'

type Props = {
  asset: PortfolioAsset
  index: number
  onClick?: () => void
}

export function TokenRow({ asset, index, onClick }: Props) {
  const { balanceHidden } = useWalletShell()

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.3 }}
    >
      <button
        type="button"
        onClick={onClick}
        className="wallet-surface flex w-full items-center gap-3.5 rounded-[var(--premium-radius-xl)] px-4 py-3.5 text-left"
      >
        <TokenIcon symbol={asset.symbol} chainId={asset.chainId} size={40} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--premium-text)]">{asset.name}</p>
          <p className="text-xs text-[var(--premium-text-muted)]">
            {asset.chainId !== 97453 ? (
              <span className="rounded-md bg-[var(--premium-gold-soft)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--premium-text-muted)]">
                {asset.chainId === 56 ? 'BSC' : asset.chainName}
              </span>
            ) : (
              asset.symbol
            )}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums text-[var(--premium-text)]">
            {balanceHidden
              ? '••••'
              : asset.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </p>
          <p className="text-xs tabular-nums text-[var(--premium-text-muted)]">
            {balanceHidden ? '••••' : asset.symbol}
          </p>
        </div>
      </button>
    </motion.li>
  )
}

function AssetSkeleton() {
  return (
    <div className="wallet-surface flex items-center gap-3.5 rounded-[var(--premium-radius-xl)] px-4 py-3.5">
      <div className="wallet-row-avatar animate-pulse rounded-2xl bg-[var(--premium-border)]" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--premium-border)]" />
        <div className="h-2 w-16 animate-pulse rounded bg-[var(--premium-border)]" />
      </div>
    </div>
  )
}

type ListProps = {
  assets: PortfolioAsset[]
  loading?: boolean
}

export function AssetList({ assets, loading }: ListProps) {
  return (
    <ul className="space-y-2.5">
      {loading
        ? Array.from({ length: 4 }).map((_, i) => <AssetSkeleton key={i} />)
        : assets.length === 0
          ? (
              <li className="wallet-surface rounded-[var(--premium-radius-xl)] px-4 py-10 text-center text-sm text-[var(--premium-text-muted)]">
                No assets yet. Fund your wallet to get started.
              </li>
            )
          : assets.map((asset, i) => (
              <TokenRow key={`${asset.chainId}-${asset.symbol}`} asset={asset} index={i} />
            ))}
    </ul>
  )
}
