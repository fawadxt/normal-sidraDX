import type { SwapRecord } from './api'

export type WalletNotificationType = 'swap' | 'send' | 'received'

export type WalletNotification = {
  id: string
  type: WalletNotificationType
  title: string
  body: string
  createdAt: string
  read: boolean
  txHash?: string
}

const STORAGE_KEY = 'sidra_wallet_notifications'
const MAX_NOTIFICATIONS = 50

function txType(record: SwapRecord): WalletNotificationType {
  if (record.fromToken === 'SDA' && record.toToken && record.toToken !== 'SDA' && record.toToken !== 'WSDA') {
    return 'swap'
  }
  if (record.toToken === 'SDA' || record.toToken === 'WSDA') return 'received'
  return 'send'
}

export function loadNotifications(): WalletNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as WalletNotification[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveNotifications(items: WalletNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)))
}

export function getSwapRecordDedupeKeys(record: SwapRecord): string[] {
  return [record.swapTxHash, record.feeTxHash, record.id].filter(Boolean) as string[]
}

function notificationKeys(notification: WalletNotification): string[] {
  return [notification.id, notification.txHash].filter(Boolean) as string[]
}

function sharesNotificationKey(a: WalletNotification, b: WalletNotification): boolean {
  const keys = new Set(notificationKeys(a))
  return notificationKeys(b).some((key) => keys.has(key))
}

export function notificationFromSwapRecord(record: SwapRecord): WalletNotification {
  const kind = txType(record)
  const from = record.fromToken ?? 'SDA'
  const to = record.toToken ?? 'SDA'

  const title =
    kind === 'swap' ? 'Swap completed' : kind === 'received' ? 'Funds received' : 'Transaction sent'

  const body =
    kind === 'swap'
      ? `Swapped ${record.inputAmount} ${from} → ${record.outputAmount} ${to}`
      : kind === 'received'
        ? `Received ${record.outputAmount} ${to}`
        : `Sent ${record.inputAmount} ${from}`

  const txHash = record.swapTxHash ?? record.feeTxHash

  return {
    id: txHash ?? record.id ?? `${record.walletAddress}-${record.createdAt}`,
    type: kind,
    title,
    body,
    createdAt: record.createdAt,
    read: false,
    txHash,
  }
}

export function createSendNotification(amount: string, token: string, txHash: string): WalletNotification {
  return {
    id: txHash,
    type: 'send',
    title: 'Transaction sent',
    body: `Sent ${amount} ${token} successfully`,
    createdAt: new Date().toISOString(),
    read: false,
    txHash,
  }
}

export function createSwapNotification(
  fromToken: string,
  toToken: string,
  amountIn: string,
  amountOut: string,
  txHash: string,
): WalletNotification {
  return {
    id: txHash,
    type: 'swap',
    title: 'Swap completed',
    body: `Swapped ${amountIn} ${fromToken} → ${amountOut} ${toToken}`,
    createdAt: new Date().toISOString(),
    read: false,
    txHash,
  }
}

export function mergeNotification(
  items: WalletNotification[],
  next: WalletNotification,
): WalletNotification[] {
  if (items.some((n) => sharesNotificationKey(n, next))) return items
  return [next, ...items].slice(0, MAX_NOTIFICATIONS)
}
