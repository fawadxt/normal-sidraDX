import { hasPasscode } from './walletLock'
import { hasStoredWallet } from './walletStorage'

const ONBOARDING_COMPLETE_KEY = 'sp_wallet_onboarding_complete'

export type OnboardingStep = 'passcode' | 'wallet'

export function hasCompletedOnboarding(): boolean {
  if (localStorage.getItem(ONBOARDING_COMPLETE_KEY) === '1') return true
  // Migrate installs that completed setup before this flag existed
  if (hasPasscode() && hasStoredWallet()) {
    markOnboardingComplete()
    return true
  }
  return false
}

export function markOnboardingComplete(): void {
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, '1')
}

export function clearOnboardingComplete(): void {
  localStorage.removeItem(ONBOARDING_COMPLETE_KEY)
}

/** First-time setup only — not triggered by wallet disconnect. */
export function needsOnboarding(): boolean {
  if (!hasPasscode()) return true
  if (!hasCompletedOnboarding()) return true
  return false
}

/** Wallet re-import screen (passcode already set). */
export function needsWalletReconnect(): boolean {
  return hasPasscode() && hasCompletedOnboarding() && !hasStoredWallet()
}

export function getOnboardingStep(): OnboardingStep | null {
  if (!hasPasscode()) return 'passcode'
  if (!hasCompletedOnboarding() || !hasStoredWallet()) return 'wallet'
  return null
}
