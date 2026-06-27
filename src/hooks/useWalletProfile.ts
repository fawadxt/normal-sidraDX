import { useCallback, useEffect, useState } from 'react'
import { BRAND } from '../config/brand'
import {
  getWalletDisplayName,
  listWalletProfiles,
  removeWalletProfile,
  renameWalletProfile,
  upsertWalletProfile,
  type WalletProfile,
} from '../lib/walletProfiles'

export function useWalletProfile(address: string | undefined) {
  const [profiles, setProfiles] = useState<WalletProfile[]>(() => listWalletProfiles())
  const [displayName, setDisplayName] = useState(() => getWalletDisplayName(address))

  useEffect(() => {
    if (address) upsertWalletProfile(address)
    setProfiles(listWalletProfiles())
    setDisplayName(getWalletDisplayName(address))
  }, [address])

  const rename = useCallback(
    (name: string) => {
      if (!address) return
      renameWalletProfile(address, name)
      setDisplayName(name.trim() || BRAND.name)
      setProfiles(listWalletProfiles())
    },
    [address],
  )

  const remove = useCallback(() => {
    if (!address) return
    removeWalletProfile(address)
    setProfiles(listWalletProfiles())
  }, [address])

  return {
    profiles,
    displayName,
    profileCount: profiles.length,
    rename,
    remove,
    refresh: () => setProfiles(listWalletProfiles()),
  }
}
