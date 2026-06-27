import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PasscodeDots } from '../components/lock/PasscodeDots'
import { UnlockKeypad } from '../components/lock/UnlockKeypad'
import { useWalletLock } from '../context/WalletLockContext'
import { hapticTap } from '../lib/haptics'
import { getWalletDisplayName, listWalletProfiles } from '../lib/walletProfiles'
import {
  getFailedAttempts,
  getLockoutRemainingMs,
  isPasscodeLockedOut,
  MAX_PASSCODE_ATTEMPTS,
  registerFailedPasscodeAttempt,
} from '../lib/walletLock'
import { loadWalletSettings } from '../lib/walletSettings'
import { BRAND } from '../config/brand'
import { ApkDownloadBanner } from '../components/wallet/ApkDownloadBanner'

const PIN_LENGTH = 4

function useUnlockWalletLabel() {
  return useMemo(() => {
    const profiles = listWalletProfiles()
    const primary = profiles[0]
    if (!primary) return { name: BRAND.name, initials: BRAND.shortName.slice(0, 2).toUpperCase() }
    const name = getWalletDisplayName(primary.address, BRAND.name)
    return { name, initials: name.slice(0, 2).toUpperCase() }
  }, [])
}

export function UnlockPage() {
  const { unlockWithPasscode, unlockWithBiometric, biometricAvailable } = useWalletLock()
  const settings = loadWalletSettings()
  const biometricEnabled = settings.biometricLock && biometricAvailable
  const { name: walletName, initials } = useUnlockWalletLabel()

  const [digits, setDigits] = useState<number[]>([])
  const [shake, setShake] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [lockedOut, setLockedOut] = useState(() => isPasscodeLockedOut())
  const [lockoutMs, setLockoutMs] = useState(() => getLockoutRemainingMs())

  useEffect(() => {
    if (!lockedOut) return
    const id = window.setInterval(() => {
      const remaining = getLockoutRemainingMs()
      setLockoutMs(remaining)
      if (remaining <= 0) {
        setLockedOut(false)
        setError(null)
      } else {
        setError(`Too many attempts. Wait ${Math.ceil(remaining / 1000)}s`)
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [lockedOut])

  const submitPin = useCallback(
    async (pin: string) => {
      if (lockedOut) return
      setUnlocking(true)
      const ok = await unlockWithPasscode(pin)
      setUnlocking(false)
      if (ok) return

      hapticTap('error')
      const result = registerFailedPasscodeAttempt()
      setShake(true)
      setDigits([])
      window.setTimeout(() => setShake(false), 450)

      if (result.lockedOut) {
        setLockedOut(true)
        setLockoutMs(result.remainingMs)
        setError(`Too many attempts. Wait ${Math.ceil(result.remainingMs / 1000)}s`)
        return
      }

      const attemptsLeft = MAX_PASSCODE_ATTEMPTS - getFailedAttempts()
      setError(
        attemptsLeft <= 1
          ? 'Wrong passcode. Last attempt before lockout'
          : `Wrong passcode. ${attemptsLeft} attempts left`,
      )
    },
    [lockedOut, unlockWithPasscode],
  )

  useEffect(() => {
    if (digits.length !== PIN_LENGTH || unlocking || lockedOut) return
    void submitPin(digits.join(''))
  }, [digits, lockedOut, submitPin, unlocking])

  const pushDigit = useCallback(
    (digit: string) => {
      if (unlocking || lockedOut || digits.length >= PIN_LENGTH) return
      setError(null)
      setDigits((prev) => [...prev, Number(digit)])
    },
    [digits.length, lockedOut, unlocking],
  )

  const backspace = useCallback(() => {
    if (unlocking || lockedOut) return
    setError(null)
    setDigits((prev) => prev.slice(0, -1))
  }, [lockedOut, unlocking])

  useEffect(() => {
    if (!biometricEnabled || lockedOut) return
    const id = window.setTimeout(() => {
      void unlockWithBiometric()
    }, 350)
    return () => window.clearTimeout(id)
  }, [biometricEnabled, lockedOut, unlockWithBiometric])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (lockedOut || unlocking) return
      if (event.key >= '0' && event.key <= '9') {
        event.preventDefault()
        pushDigit(event.key)
        return
      }
      if (event.key === 'Backspace') {
        event.preventDefault()
        backspace()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [backspace, lockedOut, pushDigit, unlocking])

  const lockoutSeconds = Math.max(1, Math.ceil(lockoutMs / 1000))

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-dvh flex-col overflow-x-hidden overflow-y-auto bg-white px-5 pb-safe pt-safe"
    >
      <div className="relative flex flex-1 flex-col items-center justify-center">
        <motion.div
          animate={unlocking ? { scale: 0.96, opacity: 0.85 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center text-center"
        >
          {walletName === BRAND.name ? (
            <img
              src={BRAND.iconPath}
              alt=""
              className="mb-5 h-[4.5rem] w-[4.5rem] rounded-[22%] object-cover shadow-[0_16px_48px_rgba(30,42,58,0.22)]"
            />
          ) : (
            <div
              className="mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-[1.125rem] font-semibold text-white shadow-[var(--premium-shadow-gold)]"
              style={{ background: 'linear-gradient(145deg, #E8D5A3 0%, #C9A84C 50%, #1E2A3A 100%)' }}
            >
              {initials}
            </div>
          )}

          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">{walletName}</h1>
          <p className="mt-1 text-sm text-[#777777]">Enter passcode to unlock</p>

          <div className="mt-8">
            <PasscodeDots filled={digits.length} shake={shake} variant="light" />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 max-w-[16rem] text-xs font-medium text-red-500"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {biometricEnabled && !lockedOut && (
            <button
              type="button"
              onClick={() => void unlockWithBiometric()}
              className="tap-target mt-5 text-sm font-semibold text-[#A67C00] transition-opacity active:opacity-70"
            >
              Use fingerprint
            </button>
          )}
        </motion.div>
      </div>

      <div className="relative pb-8 pt-4">
        {lockedOut && (
          <p className="mb-4 text-center text-sm font-medium text-[#777777]">
            Keypad locked · {lockoutSeconds}s
          </p>
        )}

        <UnlockKeypad
          onDigit={pushDigit}
          onBackspace={backspace}
          onBiometric={() => void unlockWithBiometric()}
          biometricEnabled={biometricEnabled}
          disabled={lockedOut || unlocking}
        />

        <ApkDownloadBanner compact className="mt-6" />

        <p className="mt-4 text-center text-[11px] font-medium tracking-wide text-[var(--premium-text-muted)]">
          {BRAND.name}
        </p>
      </div>
    </motion.div>
  )
}
