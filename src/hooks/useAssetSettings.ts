import { useCallback, useEffect, useState } from 'react'
import type { SwapToken } from '../lib/api'
import {
  DEFAULT_ASSET_SETTINGS,
  loadAssetSettings,
  mergeTokenOrder,
  restoreHiddenTokens,
  resetAssetLayout,
  saveAssetSettings,
  type AssetSettings,
} from '../lib/assetSettings'

export function useAssetSettings(defaultSymbols: string[] = []) {
  const [settings, setSettings] = useState<AssetSettings>(() => loadAssetSettings())

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sidra_asset_settings') setSettings(loadAssetSettings())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = useCallback((next: AssetSettings) => {
    saveAssetSettings(next)
    setSettings(next)
  }, [])

  const setTokenVisible = useCallback(
    (symbol: string, visible: boolean) => {
      setSettings((prev) => {
        const next = {
          ...prev,
          visibility: { ...prev.visibility, [symbol]: visible },
        }
        saveAssetSettings(next)
        return next
      })
    },
    [],
  )

  const setOrder = useCallback((order: string[]) => {
    setSettings((prev) => {
      const next = { ...prev, order }
      saveAssetSettings(next)
      return next
    })
  }, [])

  const updateSettings = useCallback(
    (patch: Partial<AssetSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch }
        if (patch.activityTypes) {
          next.activityTypes = { ...prev.activityTypes, ...patch.activityTypes }
        }
        saveAssetSettings(next)
        return next
      })
    },
    [],
  )

  const orderedSymbols = mergeTokenOrder(defaultSymbols, settings.order)

  const handleRestoreHidden = useCallback(() => {
    persist(restoreHiddenTokens(settings))
  }, [persist, settings])

  const handleResetLayout = useCallback(() => {
    persist(resetAssetLayout(defaultSymbols))
  }, [defaultSymbols, persist])

  const resetToDefaults = useCallback(() => {
    persist({ ...DEFAULT_ASSET_SETTINGS, order: [...defaultSymbols] })
  }, [defaultSymbols, persist])

  return {
    settings,
    orderedSymbols,
    setTokenVisible,
    setOrder,
    updateSettings,
    restoreHidden: handleRestoreHidden,
    resetLayout: handleResetLayout,
    resetToDefaults,
  }
}

export type ManagedToken = {
  symbol: string
  name: string
  displayLabel: string
  amount: number
  valueUsd: number
  visible: boolean
  isCustom: boolean
}

export function buildManagedTokens(
  tokens: SwapToken[],
  balances: Record<string, string>,
  assetSettings: AssetSettings,
  sdaPriceUsd: number,
): ManagedToken[] {
  const order = mergeTokenOrder(
    tokens.map((t) => t.symbol),
    assetSettings.order,
  )

  return order.map((symbol) => {
    const token = tokens.find((t) => t.symbol === symbol)
    const raw = balances[symbol]
    const amount =
      !raw || raw === '…' || raw === '—' ? 0 : Number.parseFloat(raw) || 0
    const isSdaLike = symbol === 'SDA' || symbol === 'WSDA'
    const valueUsd = isSdaLike ? amount * sdaPriceUsd : 0
    const displayLabel = symbol === 'SDA' ? 'SIDRA' : symbol

    return {
      symbol,
      name: token?.name ?? symbol,
      displayLabel,
      amount,
      valueUsd,
      visible: assetSettings.visibility[symbol] !== false,
      isCustom: !token,
    }
  })
}
