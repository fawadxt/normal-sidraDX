export type SwapToken = {

  symbol: string

  name: string

  address: string | null

  decimals: number

  isNative?: boolean

}



export type SwapRecord = {

  id: string

  walletAddress: string

  inputAmount: string

  outputAmount: string

  feeAmount: string

  feeTxHash: string

  swapTxHash?: string

  fromToken: string

  toToken: string

  createdAt: string

}



export type SwapDatabase = {

  swaps: SwapRecord[]

}



export type AppConfig = {

  chainId: number

  chainName: string

  swapFeeAmount: string

  swapFeeRecipient: string | null

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

