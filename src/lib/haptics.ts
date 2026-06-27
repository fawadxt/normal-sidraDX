export function hapticTap(strength: 'light' | 'medium' | 'error' = 'light') {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  const pattern =
    strength === 'error' ? [0, 40, 60, 40] : strength === 'medium' ? 12 : 8
  navigator.vibrate(pattern)
}
