import { Capacitor } from '@capacitor/core'

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

export function getPlatform(): 'web' | 'ios' | 'android' {
  const p = Capacitor.getPlatform()
  if (p === 'ios' || p === 'android') return p
  return 'web'
}

export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}
