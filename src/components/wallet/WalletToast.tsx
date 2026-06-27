import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  message: string
  visible: boolean
}

export function WalletToast({ message, visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-[20px] border border-[#D4AF37]/30 bg-white/95 px-4 py-3 text-center text-sm font-medium text-[#111111] shadow-[0_12px_40px_rgba(212,175,55,0.2)] backdrop-blur-md"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
