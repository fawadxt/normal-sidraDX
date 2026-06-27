import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImportWalletFlow } from '../components/ImportWalletFlow'
import { CreatePasscodeFlow } from '../components/lock/CreatePasscodeFlow'
import { AppLogo } from '../components/AppLogo'
import { BRAND } from '../config/brand'
import { useWalletSettings } from '../hooks/useWalletSettings'
import { getOnboardingStep, hasCompletedOnboarding, markOnboardingComplete } from '../lib/onboarding'
import { createSession, hasPasscode } from '../lib/walletLock'

type WalletView = 'choose' | 'create' | 'import'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { updateSettings } = useWalletSettings()
  const step = getOnboardingStep()
  const [walletView, setWalletView] = useState<WalletView>('choose')
  const isReconnect = hasCompletedOnboarding() && hasPasscode()

  const finishOnboarding = () => {
    markOnboardingComplete()
    createSession()
    navigate('/', { replace: true })
  }

  const handlePasscodeComplete = () => {
    updateSettings({ passcodeLock: true, autoLock: true })
  }

  if (step === 'passcode' || !hasPasscode()) {
    return <CreatePasscodeFlow onComplete={handlePasscodeComplete} />
  }

  if (walletView === 'create' || walletView === 'import') {
    return (
      <div className="min-h-dvh bg-[var(--premium-bg)] px-4 pb-safe pt-safe">
        <div className="mx-auto max-w-md">
          <div className="wallet-surface-elevated overflow-hidden rounded-[var(--premium-radius-xl)]">
            <ImportWalletFlow
              mode={walletView}
              onBack={() => setWalletView('choose')}
              onReady={finishOnboarding}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-dvh flex-col bg-[var(--premium-bg)] px-5 pb-safe pt-safe"
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <AppLogo size="lg" showName />
        <p className="mt-3 max-w-[16rem] text-center text-sm text-[var(--premium-text-muted)]">
          {isReconnect
            ? 'Import your wallet again with your recovery phrase'
            : 'Create a new wallet or import with your recovery phrase'}
        </p>

        <div className="mt-10 w-full max-w-sm space-y-3">
          <button
            type="button"
            onClick={() => setWalletView('create')}
            className="wallet-surface flex w-full items-center gap-4 rounded-[var(--premium-radius-lg)] px-4 py-4 text-left"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--premium-brand)] text-sm font-bold text-white">
              +
            </span>
            <span>
              <span className="block text-sm font-semibold text-[var(--premium-text)]">
                Create New Wallet
              </span>
              <span className="mt-0.5 block text-xs text-[var(--premium-text-muted)]">
                New recovery phrase
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setWalletView('import')}
            className="wallet-surface flex w-full items-center gap-4 rounded-[var(--premium-radius-lg)] px-4 py-4 text-left"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--premium-accent-soft)] text-sm font-bold text-[var(--premium-brand)]">
              ↓
            </span>
            <span>
              <span className="block text-sm font-semibold text-[var(--premium-text)]">
                Import Wallet
              </span>
              <span className="mt-0.5 block text-xs text-[var(--premium-text-muted)]">
                Recovery phrase or private key
              </span>
            </span>
          </button>
        </div>
      </div>

      <p className="pb-4 text-center text-[11px] font-medium tracking-wide text-[var(--premium-text-muted)]">
        {isReconnect ? BRAND.name : `Step 2 of 2 · ${BRAND.name}`}
      </p>
    </motion.div>
  )
}
