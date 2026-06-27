import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/wallet/PageHeader'
import { TransactionList } from '../components/wallet/TransactionList'
import { fetchSwaps, type SwapRecord } from '../lib/api'
import { useAppConfig } from '../hooks/useAppConfig'
import { useAssetSettings } from '../hooks/useAssetSettings'
import { useWalletShell } from '../context/WalletShellContext'
import { useWalletRefreshTick } from '../context/WalletRefreshContext'

export function HistoryPage() {
  const { config } = useAppConfig()
  const tokenSymbols = useMemo(() => config.tokens.map((t) => t.symbol), [config.tokens])
  const { settings: assetSettings } = useAssetSettings(tokenSymbols)
  const { address, isConnected } = useWalletShell()
  const refreshTick = useWalletRefreshTick()
  const [records, setRecords] = useState<SwapRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) {
      setRecords([])
      return
    }
    setLoading(true)
    fetchSwaps(address)
      .then(setRecords)
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [address, refreshTick])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-6">
      <PageHeader title="Activity" backTo="/" />

      <div className="mx-5 mt-2">
        {!isConnected ? (
          <div className="rounded-[28px] bg-white px-6 py-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-[#777777]">Import or add a wallet in Settings to view activity.</p>
          </div>
        ) : (
          <TransactionList
            records={records}
            loading={loading}
            activityTypes={assetSettings.activityTypes}
          />
        )}
      </div>
    </motion.div>
  )
}
