import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/wallet/PageHeader'
import { NetworkSelector } from '../components/wallet/NetworkSelector'
import { WalletQrCode, downloadQrPng, type WalletQrCodeHandle } from '../components/wallet/WalletQrCode'
import { WalletToast } from '../components/wallet/WalletToast'
import { CopyIcon, DownloadIcon, ShareIcon, WarningIcon } from '../components/wallet/WalletIcons'
import { useWalletShell } from '../context/WalletShellContext'
import { useActiveChain } from '../context/ActiveChainContext'
import { bscChain } from '../config/bscChain'
import { useWalletRefreshTick } from '../context/WalletRefreshContext'

export function ReceivePage() {
  const { address, isConnected } = useWalletShell()
  const { activeChainId, activeChainName } = useActiveChain()
  const refreshTick = useWalletRefreshTick()
  const qrRef = useRef<WalletQrCodeHandle>(null)
  const [toast, setToast] = useState<string | null>(null)

  const fullAddress = address ?? ''
  const qrKey = refreshTick

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2600)
  }, [])

  const copyAddress = useCallback(async () => {
    if (!isConnected || !fullAddress) {
      showToast('Add or import a wallet in Settings')
      return
    }
    try {
      await navigator.clipboard.writeText(fullAddress)
      showToast('Address copied')
    } catch {
      showToast('Could not copy address')
    }
  }, [fullAddress, isConnected, showToast])

  const shareAddress = useCallback(async () => {
    if (!isConnected || !fullAddress) {
      showToast('Add or import a wallet in Settings')
      return
    }
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Wallet Address',
          text: fullAddress,
        })
        return
      }
      await navigator.clipboard.writeText(fullAddress)
      showToast('Address copied')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      showToast('Share unavailable')
    }
  }, [fullAddress, isConnected, showToast])

  const saveQr = useCallback(async () => {
    if (!isConnected || !fullAddress) {
      showToast('Add or import a wallet in Settings')
      return
    }
    const svg = qrRef.current?.getSvgElement()
    if (!svg) {
      showToast('QR not ready')
      return
    }
    try {
      await downloadQrPng(svg)
      showToast('QR saved')
    } catch {
      showToast('Could not save QR')
    }
  }, [fullAddress, isConnected, showToast])

  const actions = [
    { label: 'Copy', icon: CopyIcon, onClick: copyAddress },
    { label: 'Share', icon: ShareIcon, onClick: shareAddress },
    { label: 'Save QR', icon: DownloadIcon, onClick: saveQr },
  ] as const

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="wallet-page-gutter min-h-full bg-white pb-8"
      >
        <PageHeader title="Receive Crypto" backTo="/" />

        <div className="mt-5 px-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A67C00]">
            Network
          </p>
          <NetworkSelector />
        </div>

        <div className="mt-6 flex justify-center">
          <div className="rounded-[20px] bg-[#F0F0F0] p-5">
            {isConnected && fullAddress ? (
              <WalletQrCode
                key={qrKey}
                ref={qrRef}
                address={fullAddress}
                size={180}
                fgColor="#000000"
              />
            ) : (
              <div className="flex h-[180px] w-[180px] flex-col items-center justify-center rounded-2xl bg-white px-4 text-center">
                <p className="text-sm font-semibold text-[#111111]">No wallet yet</p>
                <p className="mt-1 text-xs text-[#777777]">Import a wallet in Settings</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-2.5 text-xs font-black uppercase tracking-wide text-[#111111]">
            My Wallet Address
          </p>
          <button
            type="button"
            onClick={copyAddress}
            className="flex w-full items-center gap-3 rounded-xl border border-[#E0E0E0] bg-[#F8F8F8] p-4 text-left transition-transform active:scale-[0.99]"
          >
            <span className="min-w-0 flex-1 break-all text-sm font-bold leading-relaxed text-[#111111]">
              {isConnected && fullAddress ? fullAddress : 'Add or import a wallet in Settings'}
            </span>
            <CopyIcon className="h-5 w-5 shrink-0 text-[#111111]" />
          </button>
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-[#FFF3E0] p-4 mx-5">
          <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#111111]" />
          <p className="flex-1 text-xs font-semibold leading-relaxed text-[#111111]">
            {activeChainId === bscChain.id
              ? 'Only send BNB, USDT, or USDC on BNB Smart Chain (BSC) to this address.'
              : 'Only send SDA or supported Sidra assets to this address on Sidra Chain.'}
            {' '}
            <span className="font-bold">{activeChainName}</span>
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {actions.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="tap-target flex flex-col items-center justify-center rounded-[15px] border border-[#F0F0F0] bg-white px-2 py-4 shadow-[0_4px_5px_rgba(0,0,0,0.1)] transition-transform active:scale-[0.97]"
            >
              <Icon className="h-6 w-6 text-[#111111]" />
              <span className="mt-2 text-xs font-bold text-[#111111]">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <WalletToast message={toast ?? ''} visible={!!toast} />
    </>
  )
}
