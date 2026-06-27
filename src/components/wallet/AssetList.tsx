import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { PortfolioAsset } from '../../hooks/usePortfolio'
import { useAssetSettings } from '../../hooks/useAssetSettings'
import { AssetList } from './TokenRow'

type Props = {
  assets: PortfolioAsset[]
  loading?: boolean
  tokenSymbols?: string[]
}

export function AssetListSection({ assets, loading, tokenSymbols = [] }: Props) {
  const { settings } = useAssetSettings(tokenSymbols)
  const [tab, setTab] = useState<'assets' | 'collectibles'>('assets')

  const tabs = useMemo(
    () => (settings.showCollectibles ? (['assets', 'collectibles'] as const) : (['assets'] as const)),
    [settings.showCollectibles],
  )

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="mx-5 mt-8"
    >
      {tabs.length > 1 && (
        <div className="mb-4 flex gap-1 rounded-2xl wallet-glass p-1">
          {tabs.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium capitalize transition-all duration-200 ${
                tab === id
                  ? 'wallet-surface-elevated text-[var(--premium-text)] shadow-[var(--premium-shadow-xs)]'
                  : 'text-[var(--premium-text-muted)]'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      )}

      {tab === 'assets' || !settings.showCollectibles ? (
        <AssetList assets={assets} loading={loading} />
      ) : (
        <div className="wallet-surface rounded-[var(--premium-radius-xl)] px-6 py-12 text-center">
          <p className="text-sm font-medium text-[var(--premium-text)]">No collectibles yet</p>
          <p className="mt-1 text-xs text-[var(--premium-text-muted)]">NFTs and badges will appear here</p>
        </div>
      )}
    </motion.section>
  )
}
