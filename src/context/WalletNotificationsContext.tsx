import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { SwapRecord } from '../lib/api'
import {
  createSendNotification,
  createSwapNotification,
  getSwapRecordDedupeKeys,
  loadNotifications,
  mergeNotification,
  notificationFromSwapRecord,
  saveNotifications,
  type WalletNotification,
} from '../lib/walletNotifications'
import { useWalletSettings } from '../hooks/useWalletSettings'
import { useWalletShell } from '../context/WalletShellContext'

type WalletNotificationsContextValue = {
  notifications: WalletNotification[]
  unreadCount: number
  panelOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void
  markAllRead: () => void
  clearAll: () => void
  pushNotification: (notification: WalletNotification) => void
  notifySwapSuccess: (params: {
    fromToken: string
    toToken: string
    amountIn: string
    amountOut: string
    txHash: string
  }) => void
  notifySendSuccess: (amount: string, token: string, txHash: string) => void
  syncSwapRecords: (records: SwapRecord[]) => void
}

const WalletNotificationsContext = createContext<WalletNotificationsContextValue | null>(null)

function maybeNativeNotify(title: string, body: string, enabled: boolean) {
  if (!enabled || typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, tag: title })
  } catch {
    /* ignore */
  }
}

export function WalletNotificationsProvider({ children }: { children: ReactNode }) {
  const { settings } = useWalletSettings()
  const { address } = useWalletShell()
  const [notifications, setNotifications] = useState<WalletNotification[]>(() => loadNotifications())
  const [panelOpen, setPanelOpen] = useState(false)
  const [syncedIds, setSyncedIds] = useState<Set<string>>(() => new Set(loadNotifications().map((n) => n.id)))
  const [historyInitialized, setHistoryInitialized] = useState(false)

  useEffect(() => {
    setHistoryInitialized(false)
    setSyncedIds(new Set(loadNotifications().map((n) => n.id)))
  }, [address])

  const persist = useCallback((next: WalletNotification[]) => {
    setNotifications(next)
    saveNotifications(next)
  }, [])

  const pushNotification = useCallback(
    (notification: WalletNotification) => {
      if (!settings.txAlerts) return

      setNotifications((prev) => {
        const next = mergeNotification(prev, notification)
        if (next === prev) return prev
        saveNotifications(next)
        return next
      })

      setSyncedIds((prev) => {
        const next = new Set(prev)
        if (notification.id) next.add(notification.id)
        if (notification.txHash) next.add(notification.txHash)
        return next
      })

      if (settings.pushNotifications) {
        maybeNativeNotify(notification.title, notification.body, true)
      }
    },
    [settings.pushNotifications, settings.txAlerts],
  )

  const notifySwapSuccess = useCallback(
    (params: { fromToken: string; toToken: string; amountIn: string; amountOut: string; txHash: string }) => {
      pushNotification(createSwapNotification(params.fromToken, params.toToken, params.amountIn, params.amountOut, params.txHash))
    },
    [pushNotification],
  )

  const notifySendSuccess = useCallback(
    (amount: string, token: string, txHash: string) => {
      pushNotification(createSendNotification(amount, token, txHash))
    },
    [pushNotification],
  )

  const syncSwapRecords = useCallback(
    (records: SwapRecord[]) => {
      const ids = records.flatMap((r) => getSwapRecordDedupeKeys(r))

      if (!historyInitialized) {
        setSyncedIds(new Set(ids))
        setHistoryInitialized(true)
        return
      }

      if (!settings.txAlerts) return

      const fresh = records.filter((r) => {
        const keys = getSwapRecordDedupeKeys(r)
        return keys.length > 0 && !keys.some((key) => syncedIds.has(key))
      })

      if (fresh.length === 0) return

      setSyncedIds((prev) => {
        const next = new Set(prev)
        for (const record of fresh) {
          for (const key of getSwapRecordDedupeKeys(record)) {
            next.add(key)
          }
        }
        return next
      })

      setNotifications((prev) => {
        let next = prev
        for (const record of fresh) {
          next = mergeNotification(next, notificationFromSwapRecord(record))
        }
        saveNotifications(next)
        return next
      })
    },
    [historyInitialized, settings.txAlerts, syncedIds],
  )

  const markAllRead = useCallback(() => {
    persist(notifications.map((n) => ({ ...n, read: true })))
  }, [notifications, persist])

  const clearAll = useCallback(() => {
    persist([])
    setSyncedIds(new Set())
  }, [persist])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const value = useMemo(
    (): WalletNotificationsContextValue => ({
      notifications,
      unreadCount,
      panelOpen,
      openPanel: () => {
        setPanelOpen(true)
        setNotifications((prev) => {
          const next = prev.map((n) => ({ ...n, read: true }))
          saveNotifications(next)
          return next
        })
      },
      closePanel: () => setPanelOpen(false),
      togglePanel: () => {
        setPanelOpen((open) => {
          if (!open) {
            setNotifications((prev) => {
              const next = prev.map((n) => ({ ...n, read: true }))
              saveNotifications(next)
              return next
            })
          }
          return !open
        })
      },
      markAllRead,
      clearAll,
      pushNotification,
      notifySwapSuccess,
      notifySendSuccess,
      syncSwapRecords,
    }),
    [
      clearAll,
      markAllRead,
      notifications,
      notifySendSuccess,
      notifySwapSuccess,
      panelOpen,
      pushNotification,
      syncSwapRecords,
      unreadCount,
    ],
  )

  return (
    <WalletNotificationsContext.Provider value={value}>{children}</WalletNotificationsContext.Provider>
  )
}

export function useWalletNotifications() {
  const ctx = useContext(WalletNotificationsContext)
  if (!ctx) throw new Error('useWalletNotifications must be used within WalletNotificationsProvider')
  return ctx
}
