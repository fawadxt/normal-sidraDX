import { motion } from 'framer-motion'

type Props = {
  length?: number
  filled: number
  shake?: boolean
  variant?: 'light' | 'dark'
}

export function PasscodeDots({ length = 4, filled, shake = false, variant = 'light' }: Props) {
  const isLight = variant === 'light'
  return (
    <motion.div
      animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
      transition={{ duration: 0.42 }}
      className="flex items-center justify-center gap-4"
      aria-label={`${filled} of ${length} digits entered`}
    >
      {Array.from({ length }).map((_, i) => {
        const active = i < filled
        return (
          <motion.span
            key={i}
            initial={false}
            animate={{ scale: active ? 1 : 0.92, opacity: active ? 1 : 0.55 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`h-3.5 w-3.5 rounded-full border-2 ${
              active
                ? isLight
                  ? 'border-[#A67C00] bg-[#A67C00] shadow-[0_0_10px_rgba(166,124,0,0.35)]'
                  : 'border-white bg-white shadow-[0_0_12px_rgba(255,255,255,0.55)]'
                : isLight
                  ? 'border-[#D4AF37]/45 bg-transparent'
                  : 'border-white/70 bg-transparent'
            }`}
          />
        )
      })}
    </motion.div>
  )
}
