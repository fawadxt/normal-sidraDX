import { getAddress, isAddress } from 'viem'

export type AddressValidation =
  | { ok: true; normalized: `0x${string}`; format: 'evm' | 'sidra' }
  | { ok: false; error: string }

const SIDRA_PREFIX = /^sidra1[a-z0-9]{8,}$/i

export function validateRecipient(value: string): AddressValidation {
  const trimmed = value.trim()
  if (!trimmed) return { ok: false, error: 'Address required' }

  const evmCandidate = trimmed.startsWith('0x') ? trimmed : `0x${trimmed.replace(/^0x/i, '')}`

  if (/^0x[0-9a-fA-F]{40}$/.test(evmCandidate) || isAddress(evmCandidate, { strict: false })) {
    try {
      return { ok: true, normalized: getAddress(evmCandidate), format: 'evm' }
    } catch {
      return { ok: false, error: 'Invalid wallet address' }
    }
  }

  if (SIDRA_PREFIX.test(trimmed)) {
    return {
      ok: false,
      error: 'Use your 0x wallet address to send on Sidra Chain',
    }
  }

  return { ok: false, error: 'Enter a valid SIDRA or 0x address' }
}

export function truncateRecipient(addr: string, head = 8, tail = 6) {
  if (addr.length <= head + tail + 3) return addr
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`
}
