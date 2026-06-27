import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BRAND } from '../../config/brand'
import {
  dismissApkBanner,
  getApkDownloadUrl,
  isAndroidBrowser,
  isApkBannerDismissed,
  shouldShowApkBanner,
} from '../../config/appDownload'

type Props = {
  compact?: boolean
  className?: string
}

export function ApkDownloadBanner({ compact = false, className = '' }: Props) {
  const [visible, setVisible] = useState(
    () => shouldShowApkBanner() && !isApkBannerDismissed(),
  )
  const downloadUrl = getApkDownloadUrl()
  const onAndroid = isAndroidBrowser()

  if (!visible || !downloadUrl) return null

  const subtitle = onAndroid
    ? 'Install the Android app for faster access — swap, send, and manage your wallet.'
    : 'Download the Android APK, then open it on your phone to install SidraWallet.'

  if (compact) {
    return (
      <div className={`px-4 ${className}`}>
        <a
          href={downloadUrl}
          download="sidrawallet.apk"
          className="tap-target flex w-full items-center justify-center gap-2 rounded-[14px] py-3 text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #F6D77A, #D4AF37, #A67C00)' }}
        >
          Download {BRAND.name} App
        </a>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`wallet-page-gutter pt-3 ${className}`}
      >
        <div className="rounded-[22px] border border-[#D4AF37]/35 bg-gradient-to-br from-[#FFF9E8] to-[#FFFDF8] p-4 shadow-[0_8px_28px_rgba(212,175,55,0.14)] dark:border-[#C9A84C]/30 dark:from-[#2A2418] dark:to-[#1A1814]">
          <div className="flex items-start gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #F6D77A, #D4AF37, #A67C00)' }}
              aria-hidden
            >
              {BRAND.shortName.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--premium-text)]">
                Download {BRAND.name} App
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--premium-text-muted)]">
                {subtitle}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={downloadUrl}
                  download="sidrawallet.apk"
                  className="tap-target inline-flex items-center justify-center rounded-[14px] px-4 py-2.5 text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #F6D77A, #D4AF37, #A67C00)' }}
                >
                  {onAndroid ? 'Download APK' : 'Download App'}
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
