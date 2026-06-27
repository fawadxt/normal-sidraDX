export type ThemeMode = 'gold' | 'light' | 'dark'
export type CardStyle = 'default' | 'compact'
export type AutoLockTimeout = '30s' | '1m' | '5m' | '15m' | '30m' | 'immediate'
/** @deprecated Use AutoLockTimeout */
export type SessionTimeout = AutoLockTimeout | 'never'
export type BaseCurrency = 'USD' | 'SDA'
export type GasPreference = 'standard' | 'fast'
export type AppLanguage = 'en' | 'ur' | 'ar'

export type WalletSettings = {
  theme: ThemeMode
  cardStyle: CardStyle
  compactMode: boolean
  biometricLock: boolean
  passcodeLock: boolean
  autoLock: boolean
  sessionTimeout: AutoLockTimeout
  backupReminder: boolean
  baseCurrency: BaseCurrency
  hideEmptyTokens: boolean
  defaultSlippage: number
  gasPreference: GasPreference
  txPreview: boolean
  autoRoute: boolean
  pushNotifications: boolean
  txAlerts: boolean
  swapAlerts: boolean
  soundEnabled: boolean
  language: AppLanguage
}

const STORAGE_KEY = 'sidra_wallet_settings'

export const DEFAULT_WALLET_SETTINGS: WalletSettings = {
  theme: 'gold',
  cardStyle: 'default',
  compactMode: false,
  biometricLock: false,
  passcodeLock: false,
  autoLock: true,
  sessionTimeout: '1m',
  backupReminder: true,
  baseCurrency: 'USD',
  hideEmptyTokens: true,
  defaultSlippage: 1,
  gasPreference: 'standard',
  txPreview: true,
  autoRoute: true,
  pushNotifications: true,
  txAlerts: true,
  swapAlerts: true,
  soundEnabled: false,
  language: 'en',
}

export function loadWalletSettings(): WalletSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_WALLET_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<WalletSettings> & { sessionTimeout?: string }
    const sessionTimeout = normalizeAutoLockTimeout(parsed.sessionTimeout)
    return { ...DEFAULT_WALLET_SETTINGS, ...parsed, sessionTimeout }
  } catch {
    return { ...DEFAULT_WALLET_SETTINGS }
  }
}

function normalizeAutoLockTimeout(value: string | undefined): AutoLockTimeout {
  switch (value) {
    case '30s':
    case '1m':
    case '5m':
    case '15m':
    case '30m':
    case 'immediate':
      return value
    case 'never':
      return '30m'
    default:
      return DEFAULT_WALLET_SETTINGS.sessionTimeout
  }
}

export function saveWalletSettings(settings: WalletSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function applyThemeClass(theme: ThemeMode): void {
  document.documentElement.dataset.walletTheme = theme
}
