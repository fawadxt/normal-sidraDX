import { BRAND } from '../../config/brand'
import { getApkDownloadUrl, shouldShowApkDownload } from '../../config/appDownload'

/** Persistent download row for Settings → About (always visible when URL is configured). */
export function ApkDownloadCard() {
  const downloadUrl = getApkDownloadUrl()
  if (!downloadUrl) return null

  return (
    <div className="wallet-surface mt-6 rounded-[var(--premium-radius-xl)] p-4">
      <p className="text-sm font-semibold text-[var(--premium-text)]">Android app</p>
      <p className="mt-1 text-xs text-[var(--premium-text-muted)]">
        Download the {BRAND.name} APK for Android phones.
      </p>
      <a
        href={downloadUrl}
        download="sidrawallet.apk"
        className="tap-target mt-3 inline-flex w-full items-center justify-center rounded-[14px] py-3 text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #F6D77A, #D4AF37, #A67C00)' }}
      >
        Download APK
      </a>
      {!shouldShowApkDownload() && (
        <p className="mt-2 text-center text-[10px] text-[var(--premium-text-muted)]">
          Open this page on Android to install.
        </p>
      )}
    </div>
  )
}
