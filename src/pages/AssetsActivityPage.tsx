import { useMemo, useState } from 'react'
import { Reorder, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/wallet/PageHeader'
import { SettingsSwitch, TokenManageRow } from '../components/assets/TokenManageRow'
import { SettingsSection, SettingsToggle } from '../components/settings/SettingsUI'
import { settingsIcon } from '../components/settings/SettingsIcons'
import { useAppConfig } from '../hooks/useAppConfig'
import { buildManagedTokens, useAssetSettings } from '../hooks/useAssetSettings'
import { useTokenBalances } from '../hooks/useTokenBalances'
import { useWalletSettings } from '../hooks/useWalletSettings'
import { useWalletShell } from '../context/WalletShellContext'
import type { AssetListFilter } from '../lib/assetSettings'
import type { ActivityTypeKey } from '../lib/assetSettings'

const FILTERS: { id: AssetListFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'visible', label: 'Visible' },
  { id: 'hidden', label: 'Hidden' },
  { id: 'zero', label: 'Zero Balance' },
]

const ACTIVITY_ROWS: { key: ActivityTypeKey; label: string }[] = [
  { key: 'sent', label: 'Sent' },
  { key: 'received', label: 'Received' },
  { key: 'swap', label: 'Swap' },
  { key: 'failed', label: 'Failed' },
]

export function AssetsActivityPage() {
  const { config } = useAppConfig()
  const { address } = useWalletShell()
  const { settings: walletSettings, updateSettings: updateWalletSettings } = useWalletSettings()
  const tokenSymbols = useMemo(() => config.tokens.map((t) => t.symbol), [config.tokens])
  const { settings, setTokenVisible, setOrder, updateSettings, restoreHidden, resetLayout } =
    useAssetSettings(tokenSymbols)
  const { balances, isLoading } = useTokenBalances(address, config.tokens)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<AssetListFilter>('all')

  const allTokens = useMemo(
    () => buildManagedTokens(config.tokens, balances, settings, config.exchangeRate),
    [balances, config.exchangeRate, config.tokens, settings],
  )

  const filteredTokens = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allTokens.filter((token) => {
      if (q) {
        const hay = `${token.displayLabel} ${token.symbol} ${token.name}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filter === 'visible') return token.visible
      if (filter === 'hidden') return !token.visible
      if (filter === 'zero') return token.amount === 0
      return true
    })
  }, [allTokens, filter, search])

  const reorderList = useMemo(
    () => allTokens.filter((t) => filteredTokens.some((f) => f.symbol === t.symbol)),
    [allTokens, filteredTokens],
  )

  const handleReorder = (nextVisible: typeof reorderList) => {
    const visibleSet = new Set(nextVisible.map((t) => t.symbol))
    const rest = allTokens.filter((t) => !visibleSet.has(t.symbol))
    setOrder([...nextVisible.map((t) => t.symbol), ...rest.map((t) => t.symbol)])
  }

  const toggleActivity = (key: ActivityTypeKey) => {
    updateSettings({
      activityTypes: {
        ...settings.activityTypes,
        [key]: !settings.activityTypes[key],
      },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className="pb-8"
    >
      <PageHeader
        title="Assets & Activity"
        backTo="/settings"
        right={
          <Link
            to="/settings"
            className="text-xs font-semibold text-[#A67C00]"
          >
            Done
          </Link>
        }
      />

      <div className="mx-5 mt-2 space-y-5">
        <div className="rounded-[20px] border border-black/[0.05] bg-white px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tokens"
            className="w-full bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#999999]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                filter === item.id
                  ? 'bg-[#D4AF37] text-white shadow-[0_4px_12px_rgba(212,175,55,0.35)]'
                  : 'bg-white text-[#777777] shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <section>
          <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#777777]">
            Token Visibility
          </h2>
          <p className="mb-3 px-1 text-[11px] text-[#999999]">
            Drag to reorder · Toggle to show or hide on wallet
          </p>

          <div className="overflow-hidden rounded-[24px] border border-black/[0.04] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-[#F5F5F5]" />
                ))}
              </div>
            ) : filteredTokens.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-[#777777]">No tokens match your filter.</p>
            ) : search || filter !== 'all' ? (
              filteredTokens.map((token) => (
                <TokenManageRow
                  key={token.symbol}
                  token={token}
                  onToggle={(visible) => setTokenVisible(token.symbol, visible)}
                />
              ))
            ) : (
              <Reorder.Group
                axis="y"
                values={reorderList}
                onReorder={handleReorder}
                className="list-none"
              >
                {reorderList.map((token) => (
                  <Reorder.Item
                    key={token.symbol}
                    value={token}
                    className="relative bg-white"
                    whileDrag={{ scale: 1.02, boxShadow: '0 12px 32px rgba(212,175,55,0.18)' }}
                  >
                    <TokenManageRow
                      token={token}
                      dragHandle
                      onToggle={(visible) => setTokenVisible(token.symbol, visible)}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>
        </section>

        <SettingsSection title="Advanced">
          <SettingsToggle
            label="Hide Empty Tokens"
            checked={walletSettings.hideEmptyTokens}
            icon={settingsIcon('assets', 'blue')}
            onChange={(v) => updateWalletSettings({ hideEmptyTokens: v })}
          />
          <SettingsToggle
            label="Show Small Balances"
            checked={settings.showSmallBalances}
            icon={settingsIcon('chart', 'teal')}
            onChange={(v) => updateSettings({ showSmallBalances: v })}
          />
          <SettingsToggle
            label="Show Collectibles"
            checked={settings.showCollectibles}
            icon={settingsIcon('wallet', 'gold')}
            onChange={(v) => updateSettings({ showCollectibles: v })}
          />
          <SettingsToggle
            label="Compact Mode"
            hint="Tighter layout across the wallet"
            checked={walletSettings.compactMode}
            icon={settingsIcon('compact', 'blue')}
            onChange={(v) => updateWalletSettings({ compactMode: v })}
          />
          <button
            type="button"
            onClick={restoreHidden}
            className="flex w-full items-center justify-between border-b border-black/[0.04] px-4 py-3.5 text-left text-sm font-medium text-[#111111] active:bg-[#FAFAFA]"
          >
            Restore Hidden Tokens
            <span className="text-[#C9A227]">›</span>
          </button>
          <button
            type="button"
            onClick={resetLayout}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-[#111111] active:bg-[#FAFAFA]"
          >
            Reset Asset Layout
            <span className="text-[#C9A227]">›</span>
          </button>
        </SettingsSection>

        <SettingsSection title="Activity Settings">
          <p className="border-b border-black/[0.04] px-4 py-2 text-[11px] text-[#777777]">
            Hide selected activity types from history
          </p>
          {ACTIVITY_ROWS.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between border-b border-black/[0.04] px-4 py-3.5 last:border-b-0"
            >
              <span className="text-sm font-medium text-[#111111]">{row.label}</span>
              <SettingsSwitch
                label={row.label}
                checked={settings.activityTypes[row.key]}
                onChange={() => toggleActivity(row.key)}
              />
            </div>
          ))}
        </SettingsSection>
      </div>
    </motion.div>
  )
}
