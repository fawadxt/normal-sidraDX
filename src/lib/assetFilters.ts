import type { SwapRecord } from '../lib/api'
import type { PortfolioAsset } from '../hooks/usePortfolio'
import {
  isTokenVisible,
  mergeTokenOrder,
  SMALL_BALANCE_USD,
  type AssetSettings,
} from '../lib/assetSettings'
import { sendTokenLabel } from '../lib/sendTokenLabel'

export type ActivityType = 'sent' | 'received' | 'swap' | 'failed'

export function getTxActivityType(record: SwapRecord): ActivityType {
  if (
    record.fromToken === 'SDA' &&
    record.toToken &&
    record.toToken !== 'SDA' &&
    record.toToken !== 'WSDA'
  ) {
    return 'swap'
  }
  if (record.toToken === 'SDA' || record.toToken === 'WSDA') return 'received'
  return 'sent'
}

export function isFailedTransaction(record: SwapRecord): boolean {
  return !record.swapTxHash
}

export function filterActivityRecords(
  records: SwapRecord[],
  activityTypes: AssetSettings['activityTypes'],
): SwapRecord[] {
  return records.filter((record) => {
    const kind = isFailedTransaction(record) ? 'failed' : getTxActivityType(record)
    return activityTypes[kind]
  })
}

export function sortAssetsByOrder<T extends { symbol: string }>(
  assets: T[],
  order: string[],
): T[] {
  const merged = mergeTokenOrder(
    assets.map((a) => a.symbol),
    order,
  )
  const rank = new Map(merged.map((symbol, index) => [symbol, index]))
  return [...assets].sort(
    (a, b) => (rank.get(a.symbol) ?? 9999) - (rank.get(b.symbol) ?? 9999),
  )
}

export function applyDashboardAssetFilters(
  assets: PortfolioAsset[],
  assetSettings: AssetSettings,
  options: { hideEmptyTokens: boolean },
): PortfolioAsset[] {
  let list = [...assets]

  list = list.filter((asset) => isTokenVisible(assetSettings, asset.symbol))

  if (options.hideEmptyTokens) {
    list = list.filter((asset) => asset.amount > 0)
  }

  if (!assetSettings.showSmallBalances) {
    list = list.filter(
      (asset) => asset.amount === 0 || asset.valueUsd >= SMALL_BALANCE_USD || asset.priceUsd === 0,
    )
  }

  return sortAssetsByOrder(list, assetSettings.order)
}

export function displayTokenName(symbol: string, fallbackName?: string): string {
  return sendTokenLabel(symbol) === symbol ? (fallbackName ?? symbol) : sendTokenLabel(symbol)
}
