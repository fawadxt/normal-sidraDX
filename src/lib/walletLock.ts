import type { AutoLockTimeout } from './walletSettings'

const PASSCODE_HASH_KEY = 'sidra_passcode_hash'
const PASSCODE_SALT_KEY = 'sidra_passcode_salt'
const SESSION_KEY = 'sidra_wallet_session'
const FAILED_ATTEMPTS_KEY = 'sidra_passcode_failed_attempts'
const LOCKOUT_UNTIL_KEY = 'sidra_passcode_lockout_until'

export const MAX_PASSCODE_ATTEMPTS = 5
export const PASSCODE_LOCKOUT_MS = 30_000

export type WalletSession = {
  token: string
  unlockedAt: number
  lastActivity: number
}

function randomToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function hashPasscode(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function hasPasscode(): boolean {
  return !!localStorage.getItem(PASSCODE_HASH_KEY) && !!localStorage.getItem(PASSCODE_SALT_KEY)
}

export async function setPasscode(pin: string): Promise<void> {
  const salt = crypto.randomUUID()
  const hash = await hashPasscode(pin, salt)
  localStorage.setItem(PASSCODE_SALT_KEY, salt)
  localStorage.setItem(PASSCODE_HASH_KEY, hash)
}

export async function verifyPasscode(pin: string): Promise<boolean> {
  const salt = localStorage.getItem(PASSCODE_SALT_KEY)
  const stored = localStorage.getItem(PASSCODE_HASH_KEY)
  if (!salt || !stored) return false
  const hash = await hashPasscode(pin, salt)
  return hash === stored
}

export async function changePasscode(current: string, next: string): Promise<boolean> {
  const ok = await verifyPasscode(current)
  if (!ok) return false
  await setPasscode(next)
  return true
}

export function clearPasscode(): void {
  localStorage.removeItem(PASSCODE_HASH_KEY)
  localStorage.removeItem(PASSCODE_SALT_KEY)
  clearSession()
}

export function createSession(): WalletSession {
  const session: WalletSession = {
    token: randomToken(),
    unlockedAt: Date.now(),
    lastActivity: Date.now(),
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function touchSession(): void {
  const session = loadSession()
  if (!session) return
  session.lastActivity = Date.now()
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function loadSession(): WalletSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as WalletSession
  } catch {
    return null
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function getAutoLockMs(timeout: AutoLockTimeout): number {
  switch (timeout) {
    case '30s':
      return 30_000
    case '1m':
      return 60_000
    case '5m':
      return 300_000
    case '15m':
      return 900_000
    case '30m':
      return 1_800_000
    case 'immediate':
      return 0
    default:
      return 60_000
  }
}

export function autoLockLabel(timeout: AutoLockTimeout): string {
  switch (timeout) {
    case '30s':
      return '30 sec'
    case '1m':
      return '1 min'
    case '5m':
      return '5 min'
    case '15m':
      return '15 min'
    case '30m':
      return '30 min'
    case 'immediate':
      return 'Immediately'
    default:
      return '1 min'
  }
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

export function getFailedAttempts(): number {
  const raw = sessionStorage.getItem(FAILED_ATTEMPTS_KEY)
  const n = raw ? Number(raw) : 0
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function getLockoutUntil(): number {
  const raw = sessionStorage.getItem(LOCKOUT_UNTIL_KEY)
  const n = raw ? Number(raw) : 0
  return Number.isFinite(n) ? n : 0
}

export function isPasscodeLockedOut(): boolean {
  return Date.now() < getLockoutUntil()
}

export function getLockoutRemainingMs(): number {
  return Math.max(0, getLockoutUntil() - Date.now())
}

export function clearPasscodeAttempts(): void {
  sessionStorage.removeItem(FAILED_ATTEMPTS_KEY)
  sessionStorage.removeItem(LOCKOUT_UNTIL_KEY)
}

export function registerFailedPasscodeAttempt(): { lockedOut: boolean; remainingMs: number } {
  const next = getFailedAttempts() + 1
  sessionStorage.setItem(FAILED_ATTEMPTS_KEY, String(next))

  if (next >= MAX_PASSCODE_ATTEMPTS) {
    const until = Date.now() + PASSCODE_LOCKOUT_MS
    sessionStorage.setItem(LOCKOUT_UNTIL_KEY, String(until))
    sessionStorage.setItem(FAILED_ATTEMPTS_KEY, '0')
    return { lockedOut: true, remainingMs: PASSCODE_LOCKOUT_MS }
  }

  return { lockedOut: false, remainingMs: 0 }
}
