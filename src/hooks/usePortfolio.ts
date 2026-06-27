import { useMemo } from 'react'
import type { Address } from 'viem'
import type { SwapToken } from '../lib/api'
import { useTokenBalances } from './useTokenBalances'
import { sidraChain } from '../config/sidraChain'
import { bscChain } from '../config/bscChain'
import { BSC_TOKENS } from '../../shared/bscTokens'
import { getChainName } from '../config/networks'

export type PortfolioAsset = {
  symbol: string
  name: string
  amount: number
  priceUsd: number
  valueUsd: number
  chainId: number
  chainName: string
}

function parseBalance(raw: string | undefined): number {
  if (!raw || raw === '…' || raw === '—') return 0
  const n = parseFloat(raw)
  return Number.isFinite(n) ? n : 0
}

function tokenPriceUsd(token: SwapToken, chainId: number, sdaPriceUsd: number): number {
  if (chainId === sidraChain.id && (token.symbol === 'SDA' || token.symbol === 'WSDA')) {
    return sdaPriceUsd
  }
  if (chainId === bscChain.id && (token.symbol === 'USDT' || token.symbol === 'USDC')) {
    return 1
  }
  return 0
}

function buildAssets(
  tokens: SwapToken[],
  balances: Record<string, string>,
  chainId: number,
  sdaPriceUsd: number,
): PortfolioAsset[] {
  const chainName = getChainName(chainId)

  return tokens
    .map((token) => {
      const amount = parseBalance(balances[token.symbol])
      const priceUsd = tokenPriceUsd(token, chainId, sdaPriceUsd)
      const valueUsd = priceUsd > 0 ? amount * priceUsd : 0
      return {
        symbol: token.symbol,
        name: token.name,
        amount,
        priceUsd,
        valueUsd,
        chainId,
        chainName,
      }
    })
    .filter((a) => a.amount > 0)
}

export function usePortfolio(
  address: Address | undefined,
  tokens: SwapToken[],
  sdaPriceUsd: number,
  chainId: number = sidraChain.id,
) {
  const { balances, isLoading } = useTokenBalances(address, tokens, chainId)

  const assets = useMemo((): PortfolioAsset[] => {
    return buildAssets(tokens, balances, chainId, sdaPriceUsd).sort(
      (a, b) => b.valueUsd - a.valueUsd || b.amount - a.amount,
    )
  }, [tokens, balances, chainId, sdaPriceUsd])

  const totalUsd = useMemo(
    () => assets.reduce((sum, a) => sum + a.valueUsd, 0),
    [assets],
  )

  return { assets, totalUsd, balances, isLoading }
}

export function useMultiChainPortfolio(
  address: Address | undefined,
  sidraTokens: SwapToken[],
  sdaPriceUsd: number,
) {
  const sidra = useTokenBalances(address, sidraTokens, sidraChain.id)
  const bsc = useTokenBalances(address, BSC_TOKENS, bscChain.id)

  const assets = useMemo((): PortfolioAsset[] => {
    const combined = [
      ...buildAssets(sidraTokens, sidra.balances, sidraChain.id, sdaPriceUsd),
      ...buildAssets(BSC_TOKENS, bsc.balances, bscChain.id, sdaPriceUsd),
    ]
    return combined.sort((a, b) => b.valueUsd - a.valueUsd || b.amount - a.amount)
  }, [sidraTokens, sidra.balances, bsc.balances, sdaPriceUsd])

  const totalUsd = useMemo(
    () => assets.reduce((sum, a) => sum + a.valueUsd, 0),
    [assets],
  )

  return {
    assets,
    totalUsd,
    isLoading: sidra.isLoading || bsc.isLoading,
  }
}

export function truncateAddress(addr: string, head = 6, tail = 4) {
  if (addr.length <= head + tail + 3) return addr
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`
}

/** Top card shows stablecoin received — not SDA or other Sidra tokens. */
export function getUsdtBalanceFromAssets(assets: PortfolioAsset[]): number {
  return assets
    .filter((a) => a.symbol === 'USDT')
    .reduce((sum, a) => sum + a.amount, 0)
}

export function formatUsdtHeaderBalance(usdtAmount: number): string {
  return `$${usdtAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
