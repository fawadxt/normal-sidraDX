import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import { App } from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { initNativeShell } from './lib/nativeShell.ts'
import { applyThemeClass, loadWalletSettings } from './lib/walletSettings.ts'

applyThemeClass(loadWalletSettings().theme)

function hideHtmlSplash() {
  const splash = document.getElementById('splash')
  if (!splash) return
  splash.classList.add('hide')
  window.setTimeout(() => splash.remove(), 400)
}

if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegistered() {
      hideHtmlSplash()
    },
    onRegisterError() {
      hideHtmlSplash()
    },
  })
} else {
  hideHtmlSplash()
}

void initNativeShell().finally(hideHtmlSplash)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
