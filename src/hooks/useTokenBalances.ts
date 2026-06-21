import { useBalance, useReadContracts } from 'wagmi'
import { formatUnits, type Address } from 'viem'
import { erc20Abi } from '../config/abis'
import { maxSdaSwapFromBalance } from '../../shared/platformFee'
import type { SwapToken } from '../lib/api'

export function formatTokenBalance(value: bigint | undefined, decimals = 18): string {
  if (value === undefined) return '—'
  if (value === 0n) return '0'

  const num = parseFloat(formatUnits(value, decimals))
  if (num >= 1000) {
    const floored = Math.floor(num * 100) / 100
    return floored.toFixed(2)
  }
  if (num >= 1) return num.toFixed(4).replace(/\.?0+$/, '')
  return num.toFixed(6).replace(/\.?0+$/, '')
}

export function trimAmountInput(formatted: string): string {
  if (!formatted.includes('.')) return formatted
  return formatted.replace(/\.?0+$/, '')
}

export function useTokenBalances(address: Address | undefined, tokens: SwapToken[]) {
  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({ address })

  const erc20Tokens = tokens.filter((t) => t.address)

  const { data: contractResults, isLoading: erc20Loading } = useReadContracts({
    contracts: erc20Tokens.map((t) => ({
      address: t.address as Address,
      abi: erc20Abi,
      functionName: 'balanceOf' as const,
      args: address ? ([address] as const) : undefined,
    })),
    query: { enabled: !!address },
  })

  const balances: Record<string, string> = {}
  const balancesWei: Record<string, bigint> = {}

  if (address) {
    balancesWei.SDA = nativeBalance?.value ?? 0n
    balances.SDA = nativeLoading ? '…' : formatTokenBalance(balancesWei.SDA)
  }

  erc20Tokens.forEach((token, index) => {
    const result = contractResults?.[index]
    const value =
      result?.status === 'success' ? (result.result as bigint) : erc20Loading ? undefined : 0n

    if (value !== undefined) {
      balancesWei[token.symbol] = value
    }
    balances[token.symbol] =
      value === undefined ? '…' : formatTokenBalance(value, token.decimals)
  })

  const getMaxSwapAmount = (symbol: string): string => {
    if (symbol === 'SDA') {
      const balance = balancesWei.SDA ?? 0n
      return maxSdaSwapFromBalance(balance)
    }

    const balance = balancesWei[symbol] ?? 0n
    return trimAmountInput(formatUnits(balance, 18))
  }

  return {
    balances,
    balancesWei,
    getMaxSwapAmount,
    isLoading: nativeLoading || erc20Loading,
  }
}
