import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckIcon, CopyIcon } from './WalletIcons'
import { txExplorerUrl } from '../TxExplorerLink'

type Props = {
  hash: string
  amount: string
  tokenLabel: string
  copied: boolean
  onCopyHash: () => void
}

export function SendSuccessPanel({ hash, amount, tokenLabel, copied, onCopyHash }: Props) {
  const shortHash = hash.length >= 18 ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : hash

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mx-5 mt-6 rounded-[28px] bg-white p-6 text-center shadow-[0_12px_40px_rgba(212,175,55,0.12)]"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF9E6] text-[#A67C00]">
        <CheckIcon className="h-6 w-6" stroke="#A67C00" />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-[#111111]">Transaction Sent</h2>
      <p className="mt-2 text-sm text-[#777777]">
        {amount} {tokenLabel} sent successfully
      </p>

      <div className="mt-6 rounded-[20px] border border-[#D4AF37]/20 bg-[#FFFBF0] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A67C00]">Hash</p>
        <p className="mt-1 break-all font-mono text-xs text-[#111111]">{shortHash}</p>
        <button
          type="button"
          onClick={onCopyHash}
          className="tap-target mt-3 inline-flex items-center gap-2 rounded-[14px] border border-[#D4AF37]/25 bg-white px-4 py-2.5 text-xs font-semibold text-[#A67C00] transition-transform active:scale-95"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? 'Copied' : 'Copy Hash'}
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        <a
          href={txExplorerUrl(hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-[18px] border border-[#D4AF37]/25 py-3 text-sm font-semibold text-[#A67C00] transition-transform active:scale-[0.98]"
        >
          View on Explorer
        </a>
        <Link
          to="/history"
          className="block w-full rounded-[18px] py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(212,175,55,0.3)]"
          style={{ background: 'linear-gradient(135deg, #F7D878, #D4AF37, #A67C00)' }}
        >
          View History
        </Link>
      </div>
    </motion.div>
  )
}
