import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { PasscodeDots } from './PasscodeDots'
import { BackspaceIcon, CloseIcon } from '../wallet/WalletIcons'
import { isValidPin, setPasscode, verifyPasscode } from '../../lib/walletLock'

type Mode = 'create' | 'change'

type Props = {
  open: boolean
  mode?: Mode
  onClose: () => void
  onComplete: () => void
}

type Step = 'enter' | 'confirm' | 'current'

export function SetPasscodeModal({ open, mode = 'create', onClose, onComplete }: Props) {
  const [step, setStep] = useState<Step>(mode === 'change' ? 'current' : 'enter')
  const [digits, setDigits] = useState<number[]>([])
  const [firstPin, setFirstPin] = useState('')
  const [shake, setShake] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setStep(mode === 'change' ? 'current' : 'enter')
    setDigits([])
    setFirstPin('')
    setError(null)
    setShake(false)
  }, [mode, open])

  const title =
    step === 'current'
      ? 'Current Passcode'
      : step === 'enter'
        ? mode === 'change'
          ? 'New Passcode'
          : 'Create Passcode'
        : 'Confirm Passcode'

  const fail = useCallback((message: string) => {
    setShake(true)
    setError(message)
    setDigits([])
    window.setTimeout(() => setShake(false), 450)
  }, [])

  const submitPin = useCallback(
    async (pin: string) => {
      if (step === 'current') {
        const ok = await verifyPasscode(pin)
        if (!ok) {
          fail('Wrong passcode')
          return
        }
        setStep('enter')
        setDigits([])
        setError(null)
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

      await setPasscode(pin)
      onComplete()
      onClose()
    },
    [fail, firstPin, mode, onClose, onComplete, step],
  )

  useEffect(() => {
    if (!open || digits.length !== 4) return
    void submitPin(digits.join(''))
  }, [digits, open, submitPin])

  const pushDigit = (digit: string) => {
    if (digits.length >= 4) return
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
          className="mx-auto w-full max-w-md overflow-hidden rounded-t-[28px] bg-white shadow-[0_-12px_48px_rgba(0,0,0,0.18)] sm:rounded-[28px]"
        >
          <div
            className="px-5 pb-2 pt-5"
            style={{ background: 'linear-gradient(180deg, #FFF9E6 0%, #FFFFFF 100%)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#111111]">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="wallet-icon-btn bg-white text-[#A67C00] shadow-sm"
              >
                <CloseIcon />
              </button>
            </div>
            <p className="text-xs text-[#777777]">Use a 4-digit passcode</p>
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
                  className="wallet-keypad-key bg-white text-xl font-medium text-[#111111] shadow-sm active:scale-95"
                >
                  {key}
                </button>
              ))}
              <span aria-hidden />
              <button
                type="button"
                onClick={() => pushDigit('0')}
                className="wallet-keypad-key bg-white text-xl font-medium text-[#111111] shadow-sm active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={backspace}
                aria-label="Backspace"
                className="wallet-keypad-key bg-white text-[#A67C00] shadow-sm active:scale-95"
              >
                <BackspaceIcon />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function validatePinInput(pin: string): boolean {
  return isValidPin(pin)
}
