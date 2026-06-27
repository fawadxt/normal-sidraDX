import { useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useWalletScrollContainer } from '../context/WalletScrollContext'

const COLLAPSE_DISTANCE = 210

const springConfig = { stiffness: 280, damping: 42, mass: 0.55 }

export function useWalletScrollProgress(): MotionValue<number> {
  const containerRef = useWalletScrollContainer()

  const { scrollY } = useScroll({
    container: containerRef ?? undefined,
  })

  const raw = useTransform(scrollY, [0, COLLAPSE_DISTANCE], [0, 1])

  return useSpring(raw, springConfig)
}
