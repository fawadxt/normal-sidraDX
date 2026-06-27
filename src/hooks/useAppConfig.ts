import { useEffect, useState } from 'react'
import { fetchConfig, type AppConfig } from '../lib/api'
import { useWalletRefreshTick } from '../context/WalletRefreshContext'
import { FEE_ROUTER_ADDRESS, SWAP_FEE_AMOUNT, SWAP_FEE_RECIPIENT, isSwapFeeConfigured } from '../config/constants'
import { SIDRA_TOKENS } from '../../shared/tokens'

const fallbackConfig: AppConfig = {
  chainId: 97453,
  chainName: 'Sidra Chain',
  swapFeeAmount: SWAP_FEE_AMOUNT,
  swapFeeRecipient: isSwapFeeConfigured ? SWAP_FEE_RECIPIENT ?? null : null,
  feeRouterAddress:
    FEE_ROUTER_ADDRESS && FEE_ROUTER_ADDRESS.startsWith('0x') && FEE_ROUTER_ADDRESS.length === 42
      ? FEE_ROUTER_ADDRESS
      : null,
  exchangeRate: 2.5,
  tokenAddress: '0xE4095a910209D7BE03B55D02F40d4554B1666182',
  routerAddress: null,
  sidraSwapAddress: '0xF4B3E8281e1Af643c6Db379FDE67938a4Ce1F822',
  slippageBps: 100,
  tokens: SIDRA_TOKENS.map(({ symbol, name, address, decimals, isNative }) => ({
    symbol,
    name,
    address,
    decimals,
    isNative,
  })),
}

export function useAppConfig() {
  const refreshTick = useWalletRefreshTick()
  const [config, setConfig] = useState<AppConfig>(fallbackConfig)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchConfig()
      .then((data) => {
        if (!cancelled) setConfig(data)
      })
      .catch(() => {
        if (!cancelled) {
          setError('Backend offline — using local config')
          setConfig(fallbackConfig)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [refreshTick])

  const feeRecipient = config.swapFeeRecipient as `0x${string}` | null
  const feeRouterAddress = config.feeRouterAddress as `0x${string}` | null
  const isFeeConfigured =
    (!!feeRecipient && feeRecipient.startsWith('0x') && feeRecipient.length === 42) ||
    (!!feeRouterAddress && feeRouterAddress.startsWith('0x') && feeRouterAddress.length === 42)

  return { config, isLoading, error, feeRecipient, isFeeConfigured }
}
