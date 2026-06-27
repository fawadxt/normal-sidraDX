import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useWalletConnect } from '../hooks/useWalletConnect'

type WalletShellContextValue = ReturnType<typeof useWalletConnect> & {
  balanceHidden: boolean
  toggleBalanceHidden: () => void
  walletModalOpen: boolean
  openConnect: () => void
  closeConnect: () => void
}

const WalletShellContext = createContext<WalletShellContextValue | null>(null)

export function WalletShellProvider({ children }: { children: ReactNode }) {
  const wallet = useWalletConnect()
  const [balanceHidden, setBalanceHidden] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)

  const value = useMemo(
    (): WalletShellContextValue => ({
      ...wallet,
      balanceHidden,
      toggleBalanceHidden: () => setBalanceHidden((v) => !v),
      walletModalOpen,
      openConnect: () => setWalletModalOpen(true),
      closeConnect: () => setWalletModalOpen(false),
    }),
    [wallet, balanceHidden, walletModalOpen],
  )

  return <WalletShellContext.Provider value={value}>{children}</WalletShellContext.Provider>
}

export function useWalletShell() {
  const ctx = useContext(WalletShellContext)
  if (!ctx) throw new Error('useWalletShell must be used within WalletShellProvider')
  return ctx
}

export function useOptionalWalletShell() {
  return useContext(WalletShellContext)
}
