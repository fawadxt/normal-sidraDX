import type { ReactNode } from 'react'
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FundIcon, SendIcon } from './WalletIcons'

type Action = {
  id: string
  label: string
  icon: ReactNode
  path: string
}

type Props = {
  scrollProgress?: MotionValue<number>
}

export function QuickActions({ scrollProgress }: Props) {
  const navigate = useNavigate()
  const fallbackProgress = useMotionValue(0)
  const progress = scrollProgress ?? fallbackProgress
  const fadeOpacity = useTransform(progress, [0, 0.1, 0.32], [1, 1, 0])
  const fadeY = useTransform(progress, [0, 0.1, 0.32], [0, 0, -10])

  const actions: Action[] = [
    { id: 'fund', label: 'Fund', icon: <FundIcon className="h-6 w-6 text-[var(--premium-text)]" />, path: '/receive' },
    { id: 'send', label: 'Send', icon: <SendIcon className="h-6 w-6 text-[var(--premium-text)]" />, path: '/send' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      style={{ opacity: fadeOpacity, y: fadeY }}
      className="relative z-0 wallet-page-gutter mt-6 flex items-start justify-center gap-14 px-1 sm:gap-16 sm:px-2"
    >
      {actions.map((action, i) => (
        <motion.button
          key={action.id}
          type="button"
          onClick={() => navigate(action.path)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 + i * 0.04 }}
          whileTap={{ scale: 0.9 }}
          className="tap-target group flex flex-col items-center gap-2"
        >
          <span className="wallet-action-circle group-active:scale-95">
            {action.icon}
          </span>
          <span className="max-w-full truncate text-[10px] font-medium tracking-tight text-[var(--premium-text)] sm:text-[11px]">{action.label}</span>
        </motion.button>
      ))}
    </motion.div>
  )
}
