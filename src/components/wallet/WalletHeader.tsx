import { motion } from 'framer-motion'
import { EyeIcon, EyeOffIcon, LockIcon, QrScanIcon } from './WalletIcons'
import { BRAND } from '../../config/brand'
import { useWalletShell } from '../../context/WalletShellContext'

type Props = {
  sticky?: boolean
}

export function WalletHeader({ sticky = true }: Props) {
  const { balanceHidden, toggleBalanceHidden, openConnect } = useWalletShell()

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`z-30 flex items-center justify-between px-5 pt-4 pb-2 ${
        sticky ? 'sticky top-0 bg-[#FAFAFA]/90 backdrop-blur-xl' : ''
      }`}
    >
      <button
        type="button"
        onClick={openConnect}
        aria-label="Scan QR"
        className="wallet-icon-btn bg-white text-[#A67C00] shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-transform active:scale-95"
      >
        <QrScanIcon />
      </button>

      <div className="text-center">
        <h1 className="text-lg font-semibold tracking-tight text-[var(--premium-text)]">{BRAND.name}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openConnect}
          aria-label="Lock wallet"
          className="wallet-icon-btn bg-white text-[#A67C00] shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-transform active:scale-95"
        >
          <LockIcon />
        </button>
        <button
          type="button"
          onClick={toggleBalanceHidden}
          aria-label={balanceHidden ? 'Show balance' : 'Hide balance'}
          className="wallet-icon-btn bg-white text-[#A67C00] shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-transform active:scale-95"
        >
          {balanceHidden ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </motion.header>
  )
}
