import { createContext, useContext, type RefObject } from 'react'

export const WalletScrollContext = createContext<RefObject<HTMLElement | null> | null>(null)

export function useWalletScrollContainer() {
  return useContext(WalletScrollContext)
}
