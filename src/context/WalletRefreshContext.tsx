import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'

type RefreshHandler = () => void | Promise<void>

type WalletRefreshContextValue = {
  refreshTick: number
  refresh: () => Promise<void>
  registerPageRefresh: (id: string, handler: RefreshHandler) => void
  unregisterPageRefresh: (id: string) => void
}

const WalletRefreshContext = createContext<WalletRefreshContextValue | null>(null)

export function WalletRefreshProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [refreshTick, setRefreshTick] = useState(0)
  const handlersRef = useRef(new Map<string, RefreshHandler>())
  const refreshingRef = useRef(false)

  const registerPageRefresh = useCallback((id: string, handler: RefreshHandler) => {
    handlersRef.current.set(id, handler)
  }, [])

  const unregisterPageRefresh = useCallback((id: string) => {
    handlersRef.current.delete(id)
  }, [])

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return
    refreshingRef.current = true
    try {
      await queryClient.invalidateQueries()
      await Promise.all(
        Array.from(handlersRef.current.values()).map(async (handler) => {
          try {
            await handler()
          } catch {
            // Page refresh handlers are best-effort.
          }
        }),
      )
      setRefreshTick((tick) => tick + 1)
    } finally {
      refreshingRef.current = false
    }
  }, [queryClient])

  return (
    <WalletRefreshContext.Provider
      value={{ refreshTick, refresh, registerPageRefresh, unregisterPageRefresh }}
    >
      {children}
    </WalletRefreshContext.Provider>
  )
}

export function useWalletRefresh() {
  const ctx = useContext(WalletRefreshContext)
  if (!ctx) {
    throw new Error('useWalletRefresh must be used within WalletRefreshProvider')
  }
  return ctx
}

export function useWalletRefreshTick() {
  return useContext(WalletRefreshContext)?.refreshTick ?? 0
}

export function useRegisterPageRefresh(id: string, handler: RefreshHandler) {
  const ctx = useContext(WalletRefreshContext)
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!ctx) return
    const run = () => handlerRef.current()
    ctx.registerPageRefresh(id, run)
    return () => ctx.unregisterPageRefresh(id)
  }, [ctx, id])
}
