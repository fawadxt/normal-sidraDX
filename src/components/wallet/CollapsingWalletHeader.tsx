import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQrScanner } from '../../context/QrScannerContext'
import { useWalletNotifications } from '../../context/WalletNotificationsContext'
import { useWalletShell } from '../../context/WalletShellContext'
import { parseScannedAddress } from '../../lib/parseScannedQr'
import { truncateAddress } from '../../hooks/usePortfolio'
import { NotificationBellIcon, QrScanIcon } from './WalletIcons'
import { NotificationsPanel } from './NotificationsPanel'
import { WalletToast } from './WalletToast'

const CARD_EXPANDED = 220
const HEADER_ROW = 56

const CARD_BLUE_BG =
  'linear-gradient(180deg, #2B6CB8 0%, #1E4A7A 32%, #153659 58%, #0C1F38 100%)'

type Props = {
  balance: string
  balanceTitle?: string
  changePercent?: number
  showChangePercent?: boolean
  address: string
  walletName: string
  progress: MotionValue<number>
}

export function CollapsingWalletHeader({
  balance,
  balanceTitle = 'Total Balance',
  changePercent = 0,
  showChangePercent = true,
  address,
  walletName,
  progress,
}: Props) {
  const navigate = useNavigate()
  const { openScanner } = useQrScanner()
  const { balanceHidden, toggleBalanceHidden } = useWalletShell()
  const { unreadCount, togglePanel } = useWalletNotifications()
  const positive = changePercent >= 0
  const [toast, setToast] = useState<string | null>(null)

  const [cardGone, setCardGone] = useState(false)
  useMotionValueEvent(progress, 'change', (v) => setCardGone(v > 0.82))

  const sectionHeight = useTransform(
    progress,
    [0, 0.85, 0.94, 1],
    [HEADER_ROW + CARD_EXPANDED + 12, HEADER_ROW + 28, HEADER_ROW + 6, HEADER_ROW + 4],
  )

  const cardSlotHeight = useTransform(progress, [0, 0.85, 0.94], [CARD_EXPANDED + 10, 8, 0])
  const cardMarginTop = useTransform(progress, [0, 0.94], [10, 0])
  const cardScale = useTransform(progress, [0, 0.2, 0.85], [1, 1, 0])
  const cardY = useTransform(progress, [0, 0.85], [0, -(HEADER_ROW + CARD_EXPANDED * 0.3)])
  const cardOpacity = useTransform(progress, [0, 0.45, 0.68, 0.85], [1, 1, 0.35, 0])
  const cardRadius = useTransform(progress, [0, 0.6, 0.85], [30, 22, 14])
  const cardShadow = useTransform(
    progress,
    [0, 0.5, 0.85],
    [
      '0 12px 40px rgba(30, 80, 160, 0.35), 0 4px 16px rgba(12, 31, 56, 0.2)',
      '0 6px 20px rgba(30, 80, 160, 0.2)',
      '0 0 0 rgba(30, 80, 160, 0)',
    ],
  )

  const contentOpacity = useTransform(progress, [0, 0.22, 0.4], [1, 1, 0])
  const contentScale = useTransform(progress, [0, 0.22, 0.4], [1, 1, 0.92])
  const titleY = useTransform(progress, [0, 1], [0, -1])
  const titleScale = useTransform(progress, [0, 1], [1, 0.97])
  const backdropOpacity = useTransform(progress, [0, 0.08, 1], [0, 1, 1])
  const blurPx = useTransform(progress, [0, 0.2, 1], [0, 10, 12])
  const backdropFilter = useMotionTemplate`blur(${blurPx}px)`
  const headerPaddingBottom = useTransform(progress, [0, 1], [8, 2])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 1800)
  }, [])

  const handleCopyAddress = useCallback(async () => {
    if (!address || balanceHidden) return
    try {
      await navigator.clipboard.writeText(address)
      showToast('Address copied')
    } catch {
      showToast('Could not copy address')
    }
  }, [address, balanceHidden, showToast])

  const addressLabel = address ? truncateAddress(address) : 'No wallet'

  const handleOpenScanner = useCallback(() => {
    openScanner((text) => {
      const parsed = parseScannedAddress(text)
      if (!parsed.ok) {
        showToast(parsed.error)
        return
      }
      navigate('/send', { state: { recipient: parsed.normalized } })
      showToast('Address scanned')
    })
  }, [navigate, openScanner, showToast])

  return (
    <motion.section
      className="sticky top-0 z-30 isolate overflow-hidden"
      style={{ height: sectionHeight }}
      aria-label="Wallet balance"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[var(--premium-bg-elevated)]"
        style={{ opacity: backdropOpacity }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 bottom-0"
        style={{
          opacity: backdropOpacity,
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
        }}
        aria-hidden
      />

      <motion.div
        className="relative flex items-center justify-between px-5 pt-3"
        style={{ paddingBottom: headerPaddingBottom }}
      >
        <button
          type="button"
          onClick={handleOpenScanner}
          aria-label="Scan QR code"
          className="wallet-icon-btn wallet-icon-btn-premium"
        >
          <QrScanIcon />
        </button>

        <motion.div className="min-w-0 flex-1 px-1 text-center sm:px-2" style={{ y: titleY, scale: titleScale }}>
          <h1 className="truncate text-base font-semibold tracking-tight text-[var(--premium-text)] sm:text-lg">{walletName}</h1>
        </motion.div>

        <button
          type="button"
          onClick={togglePanel}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          className="relative wallet-icon-btn wallet-icon-btn-premium"
        >
          <NotificationBellIcon />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF3B30] px-1 text-[10px] font-bold text-white ring-2 ring-[var(--premium-bg-elevated)]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </motion.div>

      <NotificationsPanel />

      <motion.div
        className="relative z-20 mx-auto w-full max-w-[calc(100%-2.5rem)] overflow-visible"
        style={{ height: cardSlotHeight, marginTop: cardMarginTop }}
      >
        <motion.div
          className="absolute inset-x-0 top-0 overflow-hidden p-[1px] will-change-transform"
          style={{
            height: CARD_EXPANDED,
            opacity: cardOpacity,
            scale: cardScale,
            y: cardY,
            borderRadius: cardRadius,
            transformOrigin: 'top center',
            pointerEvents: cardGone ? 'none' : 'auto',
            boxShadow: cardShadow,
          }}
        >
          <motion.div
            className="relative h-full overflow-hidden border border-white/10"
            style={{ borderRadius: cardRadius, background: CARD_BLUE_BG }}
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
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 38%, rgba(255,255,255,0.08) 100%)',
              }}
            />

            <motion.div
              className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-7 text-center"
              style={{ opacity: contentOpacity, scale: contentScale }}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/85">{balanceTitle}</p>

              <button
                type="button"
                onClick={toggleBalanceHidden}
                aria-label={balanceHidden ? 'Show balance' : 'Hide balance'}
                className="mt-2 max-w-full truncate px-2 text-[36px] font-semibold leading-none tracking-tight text-white drop-shadow-sm transition-opacity active:opacity-80"
              >
                {balanceHidden ? '••••••' : balance}
              </button>

              {showChangePercent && (
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
              )}

              <button
                type="button"
                onClick={handleCopyAddress}
                disabled={!address || balanceHidden}
                className="mt-5 max-w-full truncate px-3 font-mono text-[11px] tracking-wide text-white/80 transition-colors active:text-white disabled:opacity-60"
                aria-label="Copy wallet address"
              >
                {balanceHidden ? '••••••••••••••••' : addressLabel}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      <WalletToast message={toast ?? ''} visible={!!toast} />
    </motion.section>
  )
}
