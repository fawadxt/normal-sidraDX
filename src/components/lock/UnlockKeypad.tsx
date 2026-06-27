import { motion } from 'framer-motion'
import { BackspaceIcon, FingerprintIcon } from '../wallet/WalletIcons'
import { hapticTap } from '../../lib/haptics'

type Props = {
  onDigit: (digit: string) => void
  onBackspace: () => void
  onBiometric?: () => void
  biometricEnabled?: boolean
  disabled?: boolean
}

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

const keySpring = { type: 'spring' as const, stiffness: 520, damping: 32, mass: 0.55 }

const circleKeyClass =
  'wallet-unlock-key mx-auto bg-[#111111] text-white shadow-[0_6px_20px_rgba(0,0,0,0.1)] transition-shadow disabled:pointer-events-none disabled:opacity-35'

export function UnlockKeypad({
  onDigit,
  onBackspace,
  onBiometric,
  biometricEnabled,
  disabled = false,
}: Props) {
  const tapDigit = (digit: string) => {
    if (disabled) return
    hapticTap('light')
    onDigit(digit)
  }

  const tapBackspace = () => {
    if (disabled) return
    hapticTap('light')
    onBackspace()
  }

  const tapBiometric = () => {
    if (disabled || !biometricEnabled) return
    hapticTap('medium')
    onBiometric?.()
  }

  return (
    <div className="mx-auto grid w-full max-w-[min(300px,100%)] grid-cols-3 gap-x-2 gap-y-4 px-2 sm:gap-y-5">
      {keys.map((key) => (
        <motion.button
          key={key}
          type="button"
          disabled={disabled}
          whileTap={disabled ? undefined : { scale: 0.88, backgroundColor: '#2a2a2a' }}
          transition={keySpring}
          onClick={() => tapDigit(key)}
          className={`${circleKeyClass} text-[1.75rem] font-medium tracking-tight`}
        >
          {key}
        </motion.button>
      ))}

      <motion.button
        type="button"
        disabled={disabled || !biometricEnabled}
        whileTap={!disabled && biometricEnabled ? { scale: 0.88, backgroundColor: '#2a2a2a' } : undefined}
        transition={keySpring}
        onClick={tapBiometric}
        aria-label="Use fingerprint"
        className={`${circleKeyClass} disabled:bg-[#E8E8E8] disabled:text-[#B0B0B0] disabled:shadow-none`}
      >
        <FingerprintIcon className="h-6 w-6" />
      </motion.button>

      <motion.button
        type="button"
        disabled={disabled}
        whileTap={disabled ? undefined : { scale: 0.88, backgroundColor: '#2a2a2a' }}
        transition={keySpring}
        onClick={() => tapDigit('0')}
        className={`${circleKeyClass} text-[1.75rem] font-medium tracking-tight`}
      >
        0
      </motion.button>

      <motion.button
        type="button"
        disabled={disabled}
        whileTap={disabled ? undefined : { scale: 0.88, backgroundColor: '#2a2a2a' }}
        transition={keySpring}
        onClick={tapBackspace}
        aria-label="Backspace"
        className={circleKeyClass}
      >
        <BackspaceIcon className="h-6 w-6" />
      </motion.button>
    </div>
  )
}
