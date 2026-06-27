import { useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { WalletScrollContext } from '../context/WalletScrollContext'
import { WalletRefreshProvider } from '../context/WalletRefreshContext'
import { QrScannerProvider } from '../context/QrScannerContext'
import { ConnectWalletModal } from '../components/ConnectWalletModal'
import { BottomNav } from '../components/wallet/BottomNav'
import { InstallPrompt } from '../components/wallet/InstallPrompt'
import { ApkDownloadBanner } from '../components/wallet/ApkDownloadBanner'
import { PullToRefresh } from '../components/wallet/PullToRefresh'
import { WalletShellProvider, useWalletShell } from '../context/WalletShellContext'
import { WalletNotificationsProvider } from '../context/WalletNotificationsContext'
import { ActiveChainProvider } from '../context/ActiveChainContext'
import { useVisualViewport } from '../hooks/useVisualViewport'
import { useWalletSettings } from '../hooks/useWalletSettings'

function WalletChrome() {
  const scrollRef = useRef<HTMLElement>(null)
  const {
    availableWallets,
    isConnecting,
    connectError,
    handleConnect,
    walletModalOpen,
    closeConnect,
  } = useWalletShell()

  const { settings } = useWalletSettings()
  useVisualViewport()

  const themeClass =
    settings.theme === 'dark'
      ? 'wallet-theme-dark'
      : settings.theme === 'light'
        ? 'wallet-theme-light'
        : 'wallet-theme-gold'

  return (
    <div
      className={`wallet-shell flex min-h-dvh flex-col bg-[var(--premium-bg)] text-[var(--premium-text)] ${themeClass} ${
        settings.compactMode ? 'wallet-compact' : ''
      }`}
    >
      <div className="wallet-ambient-bg" aria-hidden />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <WalletScrollContext.Provider value={scrollRef}>
          <main
            ref={scrollRef}
            className="wallet-main-scroll wallet-keyboard-aware min-h-0 flex-1 overflow-y-auto"
          >
            <PullToRefresh>
              <ApkDownloadBanner />
              <Outlet />
            </PullToRefresh>
          </main>
        </WalletScrollContext.Provider>
      </div>

      <div className="wallet-bottom-nav-fixed">
        <BottomNav />
      </div>

      <InstallPrompt />

      <ConnectWalletModal
        open={walletModalOpen}
        onClose={closeConnect}
        wallets={availableWallets}
        isConnecting={isConnecting}
        connectError={connectError}
        onConnect={handleConnect}
      />
    </div>
  )
}

export function WalletLayout() {
  return (
    <WalletShellProvider>
      <WalletNotificationsProvider>
        <ActiveChainProvider>
          <WalletRefreshProvider>
            <QrScannerProvider>
              <WalletChrome />
            </QrScannerProvider>
          </WalletRefreshProvider>
        </ActiveChainProvider>
      </WalletNotificationsProvider>
    </WalletShellProvider>
  )
}
