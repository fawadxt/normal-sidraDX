import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { App as CapApp } from '@capacitor/app'
import { isBiometricAvailable, promptBiometricUnlock } from '../lib/biometricUnlock'
import { BRAND } from '../config/brand'
import { isNativePlatform } from '../lib/platform'
import {
  clearPasscodeAttempts,
  clearSession,
  createSession,
  getAutoLockMs,
  hasPasscode,
  isValidPin,
  loadSession,
  touchSession,
  verifyPasscode,
} from '../lib/walletLock'
import { needsOnboarding, needsWalletReconnect } from '../lib/onboarding'
import { useWalletSettings } from '../hooks/useWalletSettings'

type LockReason = 'launch' | 'manual' | 'auto' | 'resume'

type WalletLockContextValue = {
  isLocked: boolean
  lockEnabled: boolean
  biometricAvailable: boolean
  lockNow: () => void
  unlockWithPasscode: (pin: string) => Promise<boolean>
  unlockWithBiometric: () => Promise<boolean>
  completeUnlock: () => void
}

const WalletLockContext = createContext<WalletLockContextValue | null>(null)

export function WalletLockProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { settings } = useWalletSettings()
  const lockEnabled = settings.passcodeLock && hasPasscode() && !needsOnboarding()

  const [isLocked, setIsLocked] = useState(() => {
    if (needsOnboarding()) return false
    if (!settings.passcodeLock || !hasPasscode()) return false
    return !loadSession()
  })
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const lastActivityRef = useRef(Date.now())
  const backgroundAtRef = useRef<number | null>(null)

  useEffect(() => {
    void isBiometricAvailable().then(setBiometricAvailable)
  }, [])

  const lock = useCallback(
    (_reason: LockReason) => {
      if (!settings.passcodeLock || !hasPasscode()) return
      clearSession()
      setIsLocked(true)
      if (location.pathname !== '/unlock') {
        navigate('/unlock', { replace: true, state: { from: location } })
      }
    },
    [location, navigate, settings.passcodeLock],
  )

  const completeUnlock = useCallback(() => {
    createSession()
    lastActivityRef.current = Date.now()
    setIsLocked(false)
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname
    navigate(from && from !== '/unlock' ? from : '/', { replace: true })
  }, [location.state, navigate])

  const unlockWithPasscode = useCallback(
    async (pin: string) => {
      if (!isValidPin(pin)) return false
      const ok = await verifyPasscode(pin)
      if (!ok) return false
      clearPasscodeAttempts()
      completeUnlock()
      return true
    },
    [completeUnlock],
  )

  const unlockWithBiometric = useCallback(async () => {
    if (!settings.biometricLock || !biometricAvailable) return false
    const ok = await promptBiometricUnlock(`Unlock ${BRAND.name}`)
    if (!ok) return false
    clearPasscodeAttempts()
    completeUnlock()
    return true
  }, [biometricAvailable, completeUnlock, settings.biometricLock])

  const lockNow = useCallback(() => lock('manual'), [lock])

  useEffect(() => {
    const onOnboarding = location.pathname === '/onboarding'
    const onUnlock = location.pathname === '/unlock'

    if (needsOnboarding()) {
      setIsLocked(false)
      if (!onOnboarding) navigate('/onboarding', { replace: true })
      return
    }

    if (needsWalletReconnect()) {
      setIsLocked(false)
      if (!onOnboarding) navigate('/onboarding', { replace: true })
      return
    }

    if (onOnboarding) {
      navigate('/', { replace: true })
      return
    }

    if (!lockEnabled) {
      setIsLocked(false)
      if (onUnlock) navigate('/', { replace: true })
      return
    }

    if (!loadSession()) {
      setIsLocked(true)
    }

    if (isLocked && !onUnlock) {
      navigate('/unlock', { replace: true, state: { from: location } })
    }
  }, [isLocked, lockEnabled, location, navigate])

  useEffect(() => {
    if (!lockEnabled || isLocked) return

    const markActivity = () => {
      lastActivityRef.current = Date.now()
      touchSession()
    }

    const events = ['pointerdown', 'keydown', 'touchstart'] as const
    events.forEach((ev) => window.addEventListener(ev, markActivity, { passive: true }))

    const scrollEl = document.querySelector('.wallet-main-scroll')
    const onScroll = () => markActivity()
    scrollEl?.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, markActivity))
      scrollEl?.removeEventListener('scroll', onScroll)
    }
  }, [isLocked, lockEnabled])

  useEffect(() => {
    if (!lockEnabled || isLocked || !settings.autoLock) return

    const timeoutMs = getAutoLockMs(settings.sessionTimeout)
    if (timeoutMs <= 0) return

    const id = window.setInterval(() => {
      if (Date.now() - lastActivityRef.current >= timeoutMs) lock('auto')
    }, 1000)

    return () => window.clearInterval(id)
  }, [isLocked, lock, lockEnabled, settings.autoLock, settings.sessionTimeout])

  useEffect(() => {
    if (!lockEnabled) return

    const onVisibility = () => {
      if (!settings.autoLock || isLocked) return

      if (document.hidden) {
        backgroundAtRef.current = Date.now()
        return
      }

      const backgroundAt = backgroundAtRef.current
      backgroundAtRef.current = null
      if (backgroundAt === null) return

      if (settings.sessionTimeout === 'immediate') {
        lock('resume')
        return
      }

      const timeoutMs = getAutoLockMs(settings.sessionTimeout)
      if (Date.now() - backgroundAt >= timeoutMs) lock('resume')
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [isLocked, lock, lockEnabled, settings.autoLock, settings.sessionTimeout])

  useEffect(() => {
    if (!isNativePlatform() || !lockEnabled) return

    let handle: { remove: () => void } | undefined

    void CapApp.addListener('appStateChange', ({ isActive }) => {
      if (!settings.autoLock || isLocked) return

      if (!isActive) {
        backgroundAtRef.current = Date.now()
        return
      }

      const backgroundAt = backgroundAtRef.current
      backgroundAtRef.current = null
      if (backgroundAt === null) return

      if (settings.sessionTimeout === 'immediate') {
        lock('resume')
        return
      }

      const timeoutMs = getAutoLockMs(settings.sessionTimeout)
      if (Date.now() - backgroundAt >= timeoutMs) lock('resume')
    }).then((h) => {
      handle = h
    })

    return () => handle?.remove()
  }, [isLocked, lock, lockEnabled, settings.autoLock, settings.sessionTimeout])

  const value = useMemo(
    (): WalletLockContextValue => ({
      isLocked,
      lockEnabled,
      biometricAvailable,
      lockNow,
      unlockWithPasscode,
      unlockWithBiometric,
      completeUnlock,
    }),
    [
      biometricAvailable,
      isLocked,
      lockEnabled,
      lockNow,
      unlockWithBiometric,
      unlockWithPasscode,
      completeUnlock,
    ],
  )

  return <WalletLockContext.Provider value={value}>{children}</WalletLockContext.Provider>
}

export function useWalletLock() {
  const ctx = useContext(WalletLockContext)
  if (!ctx) throw new Error('useWalletLock must be used within WalletLockProvider')
  return ctx
}

export function useOptionalWalletLock() {
  return useContext(WalletLockContext)
}
