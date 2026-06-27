import { isNativePlatform, isStandalonePwa } from '../lib/platform'

/** Same-origin APK path — used when file is in `public/downloads/`. */
export const LOCAL_APK_PATH = '/downloads/sidrawallet.apk'

export const APK_BANNER_DISMISS_KEY = 'sidrawallet_apk_banner_dismissed_v2'

function toDirectDownloadUrl(url: string): string {
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (fileMatch) {
    return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`
  }

  const idMatch = url.match(/[?&]id=([^&]+)/)
  if (url.includes('drive.google.com') && idMatch) {
    return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`
  }

  return url
}

/** Resolved APK URL — env (Google Drive) first, then same-site `/downloads/fa-wallet.apk`. */
export function getApkDownloadUrl(): string | null {
  const fromEnv = import.meta.env.VITE_APK_DOWNLOAD_URL?.trim()
  if (fromEnv) return toDirectDownloadUrl(fromEnv)
  return LOCAL_APK_PATH
}

export function isAndroidBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  return /android/i.test(navigator.userAgent)
}

/** Show APK promo on any mobile/desktop browser — not inside the installed app. */
export function shouldShowApkBanner(): boolean {
  if (isNativePlatform() || isStandalonePwa()) return false
  return !!getApkDownloadUrl()
}

/** @deprecated use shouldShowApkBanner */
export function shouldShowApkDownload(): boolean {
  return shouldShowApkBanner()
}

export function isApkBannerDismissed(): boolean {
  try {
    return localStorage.getItem(APK_BANNER_DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

export function dismissApkBanner(): void {
  try {
    localStorage.setItem(APK_BANNER_DISMISS_KEY, '1')
  } catch {
    /* ignore */
  }
}
