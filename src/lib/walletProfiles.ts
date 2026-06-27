import { BRAND } from '../config/brand'

const PROFILES_KEY = 'sidra_wallet_profiles'

export type WalletProfile = {
  address: string
  name: string
  addedAt: string
}

function normalize(addr: string) {
  return addr.toLowerCase()
}

function readProfiles(): WalletProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as WalletProfile[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeProfiles(profiles: WalletProfile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

export function listWalletProfiles(): WalletProfile[] {
  return readProfiles()
}

export function getWalletProfile(address: string | undefined): WalletProfile | null {
  if (!address) return null
  const key = normalize(address)
  return readProfiles().find((p) => normalize(p.address) === key) ?? null
}

export function getWalletDisplayName(address: string | undefined, fallback = BRAND.name): string {
  return getWalletProfile(address)?.name ?? fallback
}

export function upsertWalletProfile(address: string, name?: string): WalletProfile {
  const key = normalize(address)
  const profiles = readProfiles()
  const existing = profiles.find((p) => normalize(p.address) === key)
  if (existing) {
    if (name?.trim()) existing.name = name.trim()
    writeProfiles(profiles)
    return existing
  }
  const profile: WalletProfile = {
    address,
    name: name?.trim() || BRAND.name,
    addedAt: new Date().toISOString(),
  }
  writeProfiles([profile, ...profiles])
  return profile
}

export function renameWalletProfile(address: string, name: string): WalletProfile {
  const trimmed = name.trim() || BRAND.name
  return upsertWalletProfile(address, trimmed)
}

export function removeWalletProfile(address: string): void {
  const key = normalize(address)
  writeProfiles(readProfiles().filter((p) => normalize(p.address) !== key))
}

export function walletProfileCount(): number {
  return readProfiles().length
}
