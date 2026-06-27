import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAppConfig } from '../hooks/useAppConfig'
import { useMultiChainPortfolio, formatUsdtHeaderBalance, getUsdtBalanceFromAssets } from '../hooks/usePortfolio'
import { useAssetSettings } from '../hooks/useAssetSettings'
import { useWalletSettings } from '../hooks/useWalletSettings'
import { applyDashboardAssetFilters } from '../lib/assetFilters'
import { fetchSwaps, type SwapRecord } from '../lib/api'
import { useWalletShell } from '../context/WalletShellContext'
import { useWalletRefreshTick } from '../context/WalletRefreshContext'
import { useWalletNotifications } from '../context/WalletNotificationsContext'
import { CollapsingWalletHeader } from '../components/wallet/CollapsingWalletHeader'
import { useWalletProfile } from '../hooks/useWalletProfile'
import { useWalletScrollProgress } from '../hooks/useWalletScrollProgress'
import { QuickActions } from '../components/wallet/QuickActions'
import { AssetListSection } from '../components/wallet/AssetList'
import { TransactionList } from '../components/wallet/TransactionList'

export function WalletHomePage() {
  const { config } = useAppConfig()
  const { settings: walletSettings } = useWalletSettings()
  const tokenSymbols = useMemo(() => config.tokens.map((t) => t.symbol), [config.tokens])
  const { settings: assetSettings } = useAssetSettings(tokenSymbols)
  const { address, isConnected, balanceHidden } = useWalletShell()
  const { displayName } = useWalletProfile(address)
  const scrollProgress = useWalletScrollProgress()
  const refreshTick = useWalletRefreshTick()
  const { syncSwapRecords } = useWalletNotifications()
  const { assets: rawAssets, isLoading } = useMultiChainPortfolio(
    address,
    config.tokens,
    config.exchangeRate,
  )
  const usdtBalance = useMemo(() => getUsdtBalanceFromAssets(rawAssets), [rawAssets])
  const assets = useMemo(
    () =>
      applyDashboardAssetFilters(rawAssets, assetSettings, {
        hideEmptyTokens: walletSettings.hideEmptyTokens,
      }),
    [rawAssets, assetSettings, walletSettings.hideEmptyTokens],
  )
  const [records, setRecords] = useState<SwapRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (!address) {
      setRecords([])
      return
    }
    setHistoryLoading(true)
    fetchSwaps(address)
      .then((data) => {
        setRecords(data)
        syncSwapRecords(data)
      })
      .catch(() => setRecords([]))
      .finally(() => setHistoryLoading(false))
  }, [address, refreshTick, syncSwapRecords])

  const balanceLabel = isConnected ? formatUsdtHeaderBalance(usdtBalance) : '$0.00'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <CollapsingWalletHeader
          balance={balanceLabel}
          balanceTitle="USDT Balance"
          showChangePercent={false}
          address={address ?? ''}
          walletName={displayName}
          progress={scrollProgress}
        />

        <QuickActions scrollProgress={scrollProgress} />

        <AssetListSection
          assets={assets}
          loading={isLoading && isConnected}
          tokenSymbols={tokenSymbols}
        />

        <section className="mx-5 mt-8 pb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--premium-text)]">Recent Activity</h2>
            <Link to="/history" className="text-xs font-medium text-[#A67C00]">
              See all
            </Link>
          </div>
          <TransactionList
            records={records}
            loading={historyLoading && isConnected}
            compact
            activityTypes={assetSettings.activityTypes}
          />
        </section>

        {isConnected && !balanceHidden && usdtBalance === 0 && assets.length === 0 && (
          <p className="mx-5 pb-4 text-center text-[11px] text-[var(--premium-text-muted)]">
            Fund your wallet to see assets here.
          </p>
        )}
      </motion.div>
  )
}
