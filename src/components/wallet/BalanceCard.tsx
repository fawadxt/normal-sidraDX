import { motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { useWalletShell } from '../../context/WalletShellContext'
import { truncateAddress } from '../../hooks/usePortfolio'
import { WalletToast } from './WalletToast'

const CARD_BLUE_BG =
  'linear-gradient(180deg, #2B6CB8 0%, #1E4A7A 32%, #153659 58%, #0C1F38 100%)'

type Props = {
  balance: string
  changePercent: number
  address: string
  expanded?: boolean
}

export function BalanceCard({ balance, changePercent, address, expanded = false }: Props) {
  const { balanceHidden } = useWalletShell()
  const positive = changePercent >= 0
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 1800)
  }, [])

  const handleCopyAddress = useCallback(async () => {
    if (!address || balanceHidden || expanded) return
    try {
      await navigator.clipboard.writeText(address)
      showToast('Address copied')
    } catch {
      showToast('Could not copy address')
    }
  }, [address, balanceHidden, expanded, showToast])

  const addressLabel = address ? truncateAddress(address) : 'No wallet'

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-5 overflow-hidden rounded-[30px]"
      >
        <div
          className="relative overflow-hidden rounded-[29px] border border-white/10 px-6 py-7"
          style={{
            background: CARD_BLUE_BG,
            boxShadow: '0 12px 40px rgba(30, 80, 160, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          }}
        >
          <motion.div
            className="pointer-events-none absolute inset-0"
            animate={{ opacity: [0.5, 0.82, 0.5] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background:
                'radial-gradient(ellipse 150% 75% at 50% 115%, rgba(255, 196, 112, 0.55) 0%, rgba(255, 138, 76, 0.28) 26%, rgba(96, 156, 255, 0.14) 48%, transparent 72%)',
            }}
          />
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]"
            animate={{ opacity: [0.35, 0.62, 0.35] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            style={{
              background:
                'linear-gradient(to top, rgba(255, 210, 130, 0.38) 0%, rgba(120, 170, 255, 0.16) 42%, transparent 100%)',
            }}
          />

          <div className="relative z-10 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/85">Total Balance</p>

            <p className="wallet-text-hero mt-2 font-semibold tracking-tight text-white drop-shadow-sm">
              {balanceHidden ? '••••••' : balance}
            </p>

            <div className="mt-3 flex items-center justify-center gap-1.5">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  positive ? 'bg-white/25 text-white' : 'bg-black/15 text-white/90'
                }`}
              >
                {positive ? '+' : ''}
                {changePercent.toFixed(1)}%
              </span>
              <span className="text-xs text-white/75">24h</span>
            </div>

            {!expanded && (
              <button
                type="button"
                onClick={handleCopyAddress}
                disabled={!address || balanceHidden}
                className="mt-5 font-mono text-[11px] tracking-wide text-white/80 transition-colors active:text-white disabled:opacity-60"
                aria-label="Copy wallet address"
              >
                {balanceHidden ? '••••••••••••••••' : addressLabel}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <WalletToast message={toast ?? ''} visible={!!toast} />
    </>
  )
}
