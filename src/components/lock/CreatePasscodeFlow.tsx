import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { BRAND } from '../../config/brand'
import { isValidPin, setPasscode } from '../../lib/walletLock'
import { PasscodeDots } from './PasscodeDots'
import { UnlockKeypad } from './UnlockKeypad'

type Step = 'enter' | 'confirm'

type Props = {
  onComplete: () => void
}

export function CreatePasscodeFlow({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('enter')
  const [digits, setDigits] = useState<number[]>([])
  const [firstPin, setFirstPin] = useState('')
  const [shake, setShake] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const title = step === 'enter' ? 'Create Passcode' : 'Confirm Passcode'

  const fail = useCallback((message: string) => {
    setShake(true)
    setError(message)
    setDigits([])
    window.setTimeout(() => setShake(false), 450)
  }, [])

  const submitPin = useCallback(
    async (pin: string) => {
      if (!isValidPin(pin)) {
        fail('Use 4 digits')
        return
      }

      if (step === 'enter') {
        setFirstPin(pin)
        setStep('confirm')
        setDigits([])
        setError(null)
        return
      }

      if (pin !== firstPin) {
        fail('Passcodes do not match')
        setStep('enter')
        setFirstPin('')
        return
      }

      setBusy(true)
      try {
        await setPasscode(pin)
        onComplete()
      } catch {
        fail('Could not save passcode')
      } finally {
        setBusy(false)
      }
    },
    [fail, firstPin, onComplete, step],
  )

  useEffect(() => {
    if (digits.length !== 4 || busy) return
    void submitPin(digits.join(''))
  }, [busy, digits, submitPin])

  const pushDigit = (digit: string) => {
    if (busy || digits.length >= 4) return
    setError(null)
    setDigits((prev) => [...prev, Number(digit)])
  }

  const backspace = () => {
    if (busy) return
    setError(null)
    setDigits((prev) => prev.slice(0, -1))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[var(--premium-bg-elevated)] px-5 pb-safe pt-safe"
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <img
          src={BRAND.iconPath}
          alt=""
          className="mb-6 h-20 w-20 rounded-[22%] object-cover shadow-[0_16px_48px_rgba(30,42,58,0.2)]"
        />

        <h1 className="text-center text-2xl font-semibold tracking-tight text-[var(--premium-text)]">
          {title}
        </h1>
        <p className="mt-2 max-w-[18rem] text-center text-sm text-[var(--premium-text-muted)]">
          {step === 'enter'
            ? 'Set a 4-digit passcode to secure your wallet'
            : 'Enter the same passcode again to confirm'}
        </p>

        <div className="mt-8">
          <PasscodeDots filled={digits.length} shake={shake} variant="light" />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 max-w-[16rem] text-center text-xs font-medium text-red-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="pb-8 pt-4">
        <UnlockKeypad
          onDigit={pushDigit}
          onBackspace={backspace}
          disabled={busy}
          biometricEnabled={false}
        />
        <p className="mt-6 text-center text-[11px] font-medium tracking-wide text-[var(--premium-text-muted)]">
          Step 1 of 2 · {BRAND.name}
        </p>
      </div>
    </motion.div>
  )
}
