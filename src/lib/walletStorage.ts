const STORAGE_KEY = 'sidradx_wallet_secret'

export type StoredWalletSecret =
  | { type: 'privateKey'; value: `0x${string}` }
  | { type: 'mnemonic'; value: string }

export function saveWalletSecret(secret: StoredWalletSecret) {
  if (secret.type === 'privateKey') {
    localStorage.setItem(STORAGE_KEY, `pk:${secret.value}`)
    return
  }
  localStorage.setItem(STORAGE_KEY, `mn:${secret.value}`)
}

export function loadWalletSecret(): StoredWalletSecret | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  if (raw.startsWith('pk:')) {
    const value = raw.slice(3) as `0x${string}`
    if (value.startsWith('0x') && value.length === 66) return { type: 'privateKey', value }
    return null
  }
  if (raw.startsWith('mn:')) {
    const value = raw.slice(3).trim()
    if (value.split(/\s+/).length >= 12) return { type: 'mnemonic', value }
  }
  return null
}

export function clearStoredPrivateKey() {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasStoredWallet(): boolean {
  return !!loadWalletSecret()
}

export function normalizePrivateKey(input: string): `0x${string}` | null {
  const trimmed = input.trim().replace(/^0x/i, '')
  if (!/^[a-fA-F0-9]{64}$/.test(trimmed)) return null
  return `0x${trimmed}` as `0x${string}`
}

export function normalizeMnemonic(input: string): string | null {
  const words = input.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length !== 12 && words.length !== 24) return null
  return words.join(' ')
}

import type { Account } from 'viem'

export async function accountFromStoredSecret(): Promise<Account | null> {
  const secret = loadWalletSecret()
  if (!secret) return null

  const { privateKeyToAccount, mnemonicToAccount } = await import('viem/accounts')

  if (secret.type === 'privateKey') {
    return privateKeyToAccount(secret.value)
  }

  return mnemonicToAccount(secret.value)
}
