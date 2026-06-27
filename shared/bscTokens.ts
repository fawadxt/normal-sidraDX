import type { SwapToken } from './tokens'

export const BSC_CHAIN_ID = 56

export const BSC_TOKENS: SwapToken[] = [
  {
    symbol: 'BNB',
    name: 'BNB',
    address: null,
    decimals: 18,
    isNative: true,
    chainId: BSC_CHAIN_ID,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x55d398326f99059fF772837431837cE094Bca103',
    decimals: 18,
    chainId: BSC_CHAIN_ID,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x8AC76a51cc950d9822D96855Ef00Ac656b58CAF55',
    decimals: 18,
    chainId: BSC_CHAIN_ID,
  },
]
