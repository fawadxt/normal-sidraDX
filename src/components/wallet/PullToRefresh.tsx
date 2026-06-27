import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useWalletRefresh } from '../../context/WalletRefreshContext'
import { useWalletScrollContainer } from '../../context/WalletScrollContext'

const PULL_THRESHOLD = 68
const MAX_PULL = 110

type Props = {
  children: ReactNode
  title?: string
}

export function PullToRefresh({ children, title = 'Pull to update...' }: Props) {
  const scrollRef = useWalletScrollContainer()
  const { refresh } = useWalletRefresh()
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)
  const pullDistanceRef = useRef(0)

  const runRefresh = useCallback(async () => {
    if (refreshing) return
    setRefreshing(true)
    setPullDistance(48)
    pullDistanceRef.current = 48
    try {
      await refresh()
    } finally {
      setRefreshing(false)
      setPullDistance(0)
      pullDistanceRef.current = 0
    }
  }, [refresh, refreshing])

  useEffect(() => {
    const el = scrollRef?.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      if (refreshing || el.scrollTop > 0) return
      startY.current = e.touches[0]?.clientY ?? 0
      pulling.current = true
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current || refreshing) return
      const touchY = e.touches[0]?.clientY ?? 0
      const delta = touchY - startY.current

      if (delta > 0 && el.scrollTop <= 0) {
        const next = Math.min(delta * 0.45, MAX_PULL)
        pullDistanceRef.current = next
        setPullDistance(next)
        if (next > 8) e.preventDefault()
        return
      }

      pulling.current = false
      pullDistanceRef.current = 0
      setPullDistance(0)
    }

    const onTouchEnd = () => {
      if (!pulling.current) return
      pulling.current = false

      if (pullDistanceRef.current >= PULL_THRESHOLD) {
        void runRefresh()
        return
      }

      pullDistanceRef.current = 0
      setPullDistance(0)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [scrollRef, refreshing, runRefresh])

  const showIndicator = pullDistance > 0 || refreshing
  const ready = pullDistance >= PULL_THRESHOLD

  return (
    <div
      className="relative min-h-full"
      style={{
        transform: showIndicator ? `translateY(${refreshing ? 48 : pullDistance}px)` : undefined,
        transition: pulling.current || refreshing ? 'none' : 'transform 0.25s ease-out',
      }}
    >
      {showIndicator && (
        <div
          className="pointer-events-none absolute inset-x-0 z-10 flex flex-col items-center justify-end"
          style={{ height: refreshing ? 48 : Math.max(pullDistance, 0), top: refreshing ? -48 : -pullDistance }}
        >
          <div
            className={`mb-2 h-6 w-6 rounded-full border-2 border-[var(--premium-text)] border-t-transparent ${
              refreshing ? 'animate-spin' : ''
            }`}
            style={{
              opacity: refreshing || ready ? 1 : Math.min(pullDistance / PULL_THRESHOLD, 1),
              transform: refreshing ? undefined : `rotate(${Math.min(pullDistance * 3, 320)}deg)`,
            }}
          />
          <p className="text-[11px] font-semibold text-[var(--premium-text-muted)]">
            {refreshing ? 'Updating...' : ready ? 'Release to update' : title}
          </p>
        </div>
      )}

      {children}
    </div>
  )
}
