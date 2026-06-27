import { useCallback, useEffect, useState } from 'react'
import {
  applyThemeClass,
  DEFAULT_WALLET_SETTINGS,
  loadWalletSettings,
  saveWalletSettings,
  type WalletSettings,
} from '../lib/walletSettings'

export function useWalletSettings() {
  const [settings, setSettings] = useState<WalletSettings>(() => loadWalletSettings())

  useEffect(() => {
    applyThemeClass(settings.theme)
  }, [settings.theme])

  const updateSettings = useCallback((patch: Partial<WalletSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveWalletSettings(next)
      return next
    })
  }, [])

  const resetSettings = useCallback(() => {
    saveWalletSettings(DEFAULT_WALLET_SETTINGS)
    setSettings({ ...DEFAULT_WALLET_SETTINGS })
    applyThemeClass(DEFAULT_WALLET_SETTINGS.theme)
  }, [])

  return { settings, updateSettings, resetSettings }
}
