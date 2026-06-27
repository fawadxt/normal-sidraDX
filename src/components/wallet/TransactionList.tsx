import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { SwapRecord } from '../../lib/api'
import { filterActivityRecords } from '../../lib/assetFilters'
import type { AssetSettings } from '../../lib/assetSettings'
import { ArrowDownIcon, ArrowUpIcon, SwapTxIcon } from './WalletIcons'

function txType(record: SwapRecord): 'sent' | 'received' | 'swap' {
  if (record.fromToken === 'SDA' && record.toToken && record.toToken !== 'SDA' && record.toToken !== 'WSDA') {
    return 'swap'
  }
  if (record.toToken === 'SDA' || record.toToken === 'WSDA') return 'received'
  return 'sent'
}

function groupByDate(records: SwapRecord[]) {
  const groups = new Map<string, SwapRecord[]>()
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  for (const record of records) {
    const key = fmt.format(new Date(record.createdAt))
    const list = groups.get(key) ?? []
    list.push(record)
    groups.set(key, list)
  }

  return Array.from(groups.entries())
}

type Props = {
  records: SwapRecord[]
  loading?: boolean
  compact?: boolean
  activityTypes?: AssetSettings['activityTypes']
}

export function TransactionList({ records, loading, compact, activityTypes }: Props) {
  const filtered = useMemo(
    () => (activityTypes ? filterActivityRecords(records, activityTypes) : records),
    [activityTypes, records],
  )

  if (loading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="wallet-surface h-16 animate-pulse rounded-[20px]" />
        ))}
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="wallet-surface rounded-[var(--premium-radius-xl)] px-4 py-10 text-center text-sm text-[var(--premium-text-muted)]">
        No transactions yet.
      </div>
    )
  }

  const groups = groupByDate(filtered)
  const shown = compact ? groups.slice(0, 1) : groups

  return (
    <div className="space-y-5">
      {shown.map(([date, txs]) => (
        <div key={date}>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--premium-text-muted)]">
            {date}
          </p>
          <ul className="space-y-2.5">
            {txs.map((tx, i) => {
              const kind = txType(tx)
              const isSent = kind === 'sent'
              const isSwap = kind === 'swap'

              return (
                <motion.li
                  key={tx.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="wallet-tx-row wallet-surface flex items-center gap-3 rounded-[20px] px-3 py-3 sm:gap-3.5 sm:px-4 sm:py-3.5"
                >
                  <div
                    className={`wallet-row-avatar rounded-full ${
                      isSwap
                        ? 'bg-[#FFF9E6] text-[#A67C00]'
                        : isSent
                          ? 'bg-[#FFF5F5] text-[#C45C5C]'
                          : 'bg-[#F0FFF4] text-[#3D9A6A]'
                    }`}
                  >
                    {isSwap ? <SwapTxIcon /> : isSent ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold capitalize text-[var(--premium-text)]">
                      {isSwap ? 'Swap' : isSent ? 'Sent' : 'Received'}{' '}
                      {tx.fromToken && tx.toToken ? `${tx.fromToken} → ${tx.toToken}` : tx.fromToken ?? 'SDA'}
                    </p>
                    <p className="text-[11px] text-[var(--premium-text-muted)]">
                      {new Date(tx.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · Confirmed
                    </p>
                  </div>

                  <div className="wallet-tx-amount min-w-0 shrink text-right">
                    <p className="truncate text-xs font-semibold tabular-nums text-[var(--premium-text)] sm:text-sm">
                      {tx.inputAmount} → {tx.outputAmount}
                    </p>
                    <p className="truncate text-[10px] text-[var(--premium-text-muted)] sm:text-xs">Fee {tx.feeAmount} SDA</p>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </div>
      ))}

      {compact && filtered.length > 0 && (
        <Link
          to="/history"
          className="block text-center text-sm font-medium text-[#A67C00]"
        >
          View all activity
        </Link>
      )}
    </div>
  )
}
