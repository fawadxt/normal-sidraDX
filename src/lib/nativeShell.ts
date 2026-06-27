import { App } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'
import { isNativePlatform } from './platform'

let initialized = false

export async function initNativeShell(): Promise<void> {
  if (!isNativePlatform() || initialized) return
  initialized = true

  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#FAFAFA' })
  } catch {
    // Status bar plugin unavailable on some builds
  }

  try {
    await SplashScreen.hide()
  } catch {
    // ignore
  }

  try {
    await Keyboard.setAccessoryBarVisible({ isVisible: false })
  } catch {
    // iOS only
  }

  App.addListener('appUrlOpen', (event) => {
    const url = event.url
    if (!url) return
    handleDeepLink(url)
  })

  App.addListener('backButton', () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    void App.exitApp()
  })
}

function handleDeepLink(url: string): void {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname || '/'
    const hashPath = parsed.hash.replace(/^#/, '')
    const target = hashPath || path
    if (target && target !== '/') {
      window.location.hash = target.startsWith('/') ? target : `/${target}`
    }
  } catch {
    // Malformed deep link
  }
}
