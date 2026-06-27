import { motion, AnimatePresence } from 'framer-motion'
import { BRAND } from '../../config/brand'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

export function InstallPrompt() {
  const { visible, install, dismiss } = useInstallPrompt()

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md px-4"
        >
          <div className="rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
            <p className="text-sm font-semibold text-[var(--premium-text)]">Install {BRAND.name}</p>
            <p className="mt-1 text-xs text-[#777777]">
              Add to your home screen for a native app experience.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => install()}
                className="tap-target flex-1 rounded-[16px] py-2.5 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #F6D77A, #D4AF37, #A67C00)' }}
              >
                Install
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="tap-target rounded-[16px] px-4 py-2.5 text-sm font-medium text-[#777777]"
              >
                Not now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
