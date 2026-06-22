export type SwapToken = {
  symbol: string
  name: string
  address: string | null
  decimals: number
  isNative?: boolean
}

export type AppConfig = {
  chainId: number
  chainName: string
  swapFeeAmount: string
  swapFeeRecipient: string | null
  feeRouterAddress: string | null
  exchangeRate: number
  tokenAddress: string
  routerAddress: string | null
  sidraSwapAddress: string | null
  slippageBps: number
  tokens: SwapToken[]
}

export type SwapQuote = {
  amountIn: string
  amountOut: string
  path: string[]
  routeType: 'wrap' | 'unwrap' | 'router' | 'sidra-buy' | 'sidra-sell'
  minAmountOut: string
  swapAddress?: string
  slippageParam?: string
}

export type SwapRecord = {
  id: string
  walletAddress: string
  inputAmount: string
  outputAmount: string
  feeAmount: string
  feeTxHash: string
  swapTxHash?: string
  fromToken?: string
  toToken?: string
  createdAt: string
}

const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function readJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    if (res.status === 504) {
      throw new Error('Quote timed out — try a smaller amount or wait a moment.')
    }
    throw new Error(
      text.startsWith('An error')
        ? 'Server error — please refresh and try again.'
        : 'Unexpected server response. Please try again.',
    )
  }
}

export async function fetchConfig(): Promise<AppConfig> {
  const res = await fetch(`${API_BASE}/api/config`)
  if (!res.ok) throw new Error('Failed to load app config')
  return readJsonResponse<AppConfig>(res)
}

export async function fetchQuote(
  from: string,
  to: string,
  amountIn: string,
): Promise<SwapQuote> {
  const params = new URLSearchParams({ from, to, amountIn })
  const res = await fetch(`${API_BASE}/api/quote?${params}`)
  const data = await readJsonResponse<SwapQuote & { error?: string }>(res)
  if (!res.ok) throw new Error(data.error ?? 'Quote failed')
  return data
}

export async function recordSwap(payload: {
  walletAddress: string
  inputAmount: string
  outputAmount: string
  feeAmount: string
  feeTxHash: string
  swapTxHash?: string
  fromToken?: string
  toToken?: string
}): Promise<SwapRecord> {
  const res = await fetch(`${API_BASE}/api/swaps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error('Failed to record swap')
  return res.json()
}

export async function fetchSwaps(walletAddress: string): Promise<SwapRecord[]> {
  const res = await fetch(`${API_BASE}/api/swaps?wallet=${walletAddress}`)
  if (!res.ok) throw new Error('Failed to load swap history')
  return res.json()
}
