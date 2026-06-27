import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSwitchChain } from 'wagmi'
import { sidraChain } from '../config/sidraChain'
import { bscChain } from '../config/bscChain'
import { SUPPORTED_CHAINS, getChainById } from '../config/networks'
import { useWalletShell } from './WalletShellContext'

type ActiveChainContextValue = {
  activeChainId: number
  activeChainName: string
  setActiveChainId: (chainId: number) => void
  switchToChain: (chainId: number) => Promise<void>
  isSwitchingChain: boolean
  supportedChains: typeof SUPPORTED_CHAINS
}

const ActiveChainContext = createContext<ActiveChainContextValue | null>(null)

export function ActiveChainProvider({ children }: { children: ReactNode }) {
  const { isConnected, chainId } = useWalletShell()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()
  const [activeChainId, setActiveChainIdState] = useState<number>(sidraChain.id)

  useEffect(() => {
    if (chainId && getChainById(chainId)) {
      setActiveChainIdState(chainId)
    }
  }, [chainId])

  const setActiveChainId = useCallback((chainId: number) => {
    if (getChainById(chainId)) setActiveChainIdState(chainId)
  }, [])

  const switchToChain = useCallback(
    async (targetChainId: number) => {
      if (!getChainById(targetChainId)) return
      setActiveChainIdState(targetChainId)
      if (!isConnected || chainId === targetChainId) return
      await new Promise<void>((resolve, reject) => {
        switchChain(
          { chainId: targetChainId },
          {
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
          },
        )
      })
    },
    [chainId, isConnected, switchChain],
  )

  const value = useMemo(
    (): ActiveChainContextValue => ({
      activeChainId,
      activeChainName: getChainById(activeChainId)?.name ?? 'Unknown',
      setActiveChainId,
      switchToChain,
      isSwitchingChain,
      supportedChains: SUPPORTED_CHAINS,
    }),
    [activeChainId, isSwitchingChain, setActiveChainId, switchToChain],
  )

  return <ActiveChainContext.Provider value={value}>{children}</ActiveChainContext.Provider>
}

export function useActiveChain() {
  const ctx = useContext(ActiveChainContext)
  if (!ctx) throw new Error('useActiveChain must be used within ActiveChainProvider')
  return ctx
}

export { sidraChain, bscChain }
