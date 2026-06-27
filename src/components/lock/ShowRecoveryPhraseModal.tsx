import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { RecoveryPhraseGrid } from '../wallet/RecoveryPhraseGrid'
import { BackspaceIcon, CloseIcon } from '../wallet/WalletIcons'
import {
  clearPasscodeAttempts,
  getFailedAttempts,
  getLockoutRemainingMs,
  isPasscodeLockedOut,
  MAX_PASSCODE_ATTEMPTS,
  registerFailedPasscodeAttempt,
  verifyPasscode,
} from '../../lib/walletLock'
import { loadWalletSecret } from '../../lib/walletStorage'
import { PasscodeDots } from './PasscodeDots'

type Props = {
  open: boolean
  onClose: () => void
}

type Step = 'passcode' | 'phrase'

export function ShowRecoveryPhraseModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>('passcode')
  const [phrase, setPhrase] = useState('')
  const [digits, setDigits] = useState<number[]>([])
  const [shake, setShake] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lockedOut, setLockedOut] = useState(false)

  useEffect(() => {
    if (!open) return
    setStep('passcode')
    setPhrase('')
    setDigits([])
    setError(null)
    setShake(false)
    setLockedOut(isPasscodeLockedOut())
  }, [open])

  useEffect(() => {
    if (!open || !lockedOut) return
    const id = window.setInterval(() => {
      const remaining = getLockoutRemainingMs()
      if (remaining <= 0) {
        setLockedOut(false)
        setError(null)
      } else {
        setError(`Too many attempts. Wait ${Math.ceil(remaining / 1000)}s`)
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [lockedOut, open])

  const fail = useCallback((message: string) => {
    setShake(true)
    setError(message)
    setDigits([])
    window.setTimeout(() => setShake(false), 450)
  }, [])

  const submitPin = useCallback(
    async (pin: string) => {
      if (lockedOut) return

      const ok = await verifyPasscode(pin)
      if (!ok) {
        const result = registerFailedPasscodeAttempt()
        if (result.lockedOut) {
          setLockedOut(true)
          fail(`Too many attempts. Wait ${Math.ceil(result.remainingMs / 1000)}s`)
          return
        }

        const attemptsLeft = MAX_PASSCODE_ATTEMPTS - getFailedAttempts()
        fail(
          attemptsLeft <= 1
            ? 'Wrong passcode. Last attempt before lockout'
            : `Wrong passcode. ${attemptsLeft} attempts left`,
        )
        return
      }

      clearPasscodeAttempts()
      const secret = loadWalletSecret()
      if (!secret || secret.type !== 'mnemonic') {
        fail('Recovery phrase not available')
        return
      }

      setPhrase(secret.value)
      setStep('phrase')
      setDigits([])
      setError(null)
    },
    [fail, lockedOut],
  )

  useEffect(() => {
    if (!open || step !== 'passcode' || digits.length !== 4) return
    void submitPin(digits.join(''))
  }, [digits, open, step, submitPin])

  const pushDigit = (digit: string) => {
    if (lockedOut || digits.length >= 4) return
    setError(null)
    setDigits((prev) => [...prev, Number(digit)])
  }

  const backspace = () => {
    setError(null)
    setDigits((prev) => prev.slice(0, -1))
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="mx-auto max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-white shadow-[0_-12px_48px_rgba(0,0,0,0.18)] sm:rounded-[28px]"
        >
          {step === 'passcode' ? (
            <>
              <div
                className="px-5 pb-2 pt-5"
                style={{ background: 'linear-gradient(180deg, #FFF9E6 0%, #FFFFFF 100%)' }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#111111]">Enter Passcode</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="wallet-icon-btn bg-white text-[#A67C00] shadow-sm"
                  >
                    <CloseIcon />
                  </button>
                </div>
                <p className="text-xs text-[#777777]">Confirm your passcode to view recovery phrase</p>
                <div className="my-6 flex justify-center">
                  <PasscodeDots filled={digits.length} shake={shake} length={4} variant="light" />
                </div>
                {error && <p className="mb-2 text-center text-xs text-red-500">{error}</p>}
              </div>

              <div className="bg-[#FAFAFA] px-3 pb-6 pt-2">
                <div className="mx-auto grid max-w-[300px] grid-cols-3 gap-2.5">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => pushDigit(key)}
                      disabled={lockedOut}
                      className="wallet-keypad-key bg-white text-xl font-medium text-[#111111] shadow-sm active:scale-95 disabled:opacity-40"
                    >
                      {key}
                    </button>
                  ))}
                  <span aria-hidden />
                  <button
                    type="button"
                    onClick={() => pushDigit('0')}
                    disabled={lockedOut}
                    className="wallet-keypad-key bg-white text-xl font-medium text-[#111111] shadow-sm active:scale-95 disabled:opacity-40"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={backspace}
                    disabled={lockedOut}
                    aria-label="Backspace"
                    className="wallet-keypad-key bg-white text-[#A67C00] shadow-sm active:scale-95 disabled:opacity-40"
                  >
                    <BackspaceIcon />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="px-5 pb-6 pt-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#111111]">Recovery Phrase</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="wallet-icon-btn bg-white text-[#A67C00] shadow-sm"
                >
                  <CloseIcon />
                </button>
              </div>
              <p className="text-xs leading-relaxed text-[#777777]">
                Write these 12 words down in order. Never share them or take a screenshot.
              </p>
              <RecoveryPhraseGrid phrase={phrase} defaultHidden className="mt-5" />
              <button
                type="button"
                onClick={onClose}
                className="wallet-cta-btn mt-5 bg-[#A67C00] text-white"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
