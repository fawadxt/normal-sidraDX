export type AssetListFilter = 'all' | 'visible' | 'hidden' | 'zero'

export type ActivityTypeKey = 'sent' | 'received' | 'swap' | 'failed'

export type AssetSettings = {
  visibility: Record<string, boolean>
  order: string[]
  showSmallBalances: boolean
  showCollectibles: boolean
  activityTypes: Record<ActivityTypeKey, boolean>
}

const STORAGE_KEY = 'sidra_asset_settings'

export const DEFAULT_ACTIVITY_TYPES: AssetSettings['activityTypes'] = {
  sent: true,
  received: true,
  swap: true,
  failed: false,
}

export const DEFAULT_ASSET_SETTINGS: AssetSettings = {
  visibility: {},
  order: [],
  showSmallBalances: true,
  showCollectibles: false,
  activityTypes: { ...DEFAULT_ACTIVITY_TYPES },
}

export const SMALL_BALANCE_USD = 0.01

export function loadAssetSettings(): AssetSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_ASSET_SETTINGS, activityTypes: { ...DEFAULT_ACTIVITY_TYPES } }
    const parsed = JSON.parse(raw) as Partial<AssetSettings>
    return {
      ...DEFAULT_ASSET_SETTINGS,
      ...parsed,
      visibility: parsed.visibility ?? {},
      order: parsed.order ?? [],
      activityTypes: { ...DEFAULT_ACTIVITY_TYPES, ...parsed.activityTypes },
    }
  } catch {
    return { ...DEFAULT_ASSET_SETTINGS, activityTypes: { ...DEFAULT_ACTIVITY_TYPES } }
  }
}

export function saveAssetSettings(settings: AssetSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function isTokenVisible(settings: AssetSettings, symbol: string): boolean {
  return settings.visibility[symbol] !== false
}

export function mergeTokenOrder(allSymbols: string[], savedOrder: string[]): string[] {
  const seen = new Set<string>()
  const ordered: string[] = []

  for (const symbol of savedOrder) {
    if (allSymbols.includes(symbol) && !seen.has(symbol)) {
      ordered.push(symbol)
      seen.add(symbol)
    }
  }

  for (const symbol of allSymbols) {
    if (!seen.has(symbol)) ordered.push(symbol)
  }

  return ordered
}

export function resetAssetLayout(defaultSymbols: string[]): AssetSettings {
  const next: AssetSettings = {
    ...DEFAULT_ASSET_SETTINGS,
    order: [...defaultSymbols],
    visibility: {},
    activityTypes: { ...DEFAULT_ACTIVITY_TYPES },
  }
  saveAssetSettings(next)
  return next
}

export function restoreHiddenTokens(settings: AssetSettings): AssetSettings {
  return { ...settings, visibility: {} }
}
