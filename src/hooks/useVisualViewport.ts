import { useEffect, useState } from 'react'

/**
 * Tracks visual viewport height to reduce layout jump when the mobile keyboard opens.
 */
export function useVisualViewport() {
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKeyboardOffset(offset)
      document.documentElement.style.setProperty('--keyboard-offset', `${offset}px`)
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      document.documentElement.style.removeProperty('--keyboard-offset')
    }
  }, [])

  return { keyboardOffset }
}
