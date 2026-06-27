import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BRAND } from '../../config/brand'
import {
  dismissApkBanner,
  getApkDownloadUrl,
  isApkBannerDismissed,
  shouldShowApkDownload,
} from '../../config/appDownload'

export function ApkDownloadBanner() {
  const [visible, setVisible] = useState(
    () => shouldShowApkDownload() && !isApkBannerDismissed(),
  )
  const downloadUrl = getApkDownloadUrl()

  if (!visible || !downloadUrl) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="wallet-page-gutter pt-3"
      >
        <div className="rounded-[22px] border border-[#D4AF37]/35 bg-gradient-to-br from-[#FFF9E8] to-[#FFFDF8] p-4 shadow-[0_8px_28px_rgba(212,175,55,0.14)] dark:border-[#C9A84C]/30 dark:from-[#2A2418] dark:to-[#1A1814]">
          <div className="flex items-start gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #F6D77A, #D4AF37, #A67C00)' }}
              aria-hidden
            >
              {BRAND.shortName}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--premium-text)]">
                Download {BRAND.name} App
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--premium-text-muted)]">
                Install the Android APK for faster access — swap, send, and manage your wallet offline-ready.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={downloadUrl}
                  download="sidrawallet.apk"
                  className="tap-target inline-flex items-center justify-center rounded-[14px] px-4 py-2.5 text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #F6D77A, #D4AF37, #A67C00)' }}
                >
                  Download APK
                </a>
                <button
                  type="button"
                  onClick={() => {
                    dismissApkBanner()
                    setVisible(false)
                  }}
                  className="tap-target rounded-[14px] px-3 py-2.5 text-sm font-medium text-[var(--premium-text-muted)]"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
