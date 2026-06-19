import { createPublicClient, http, parseEther, type Address } from 'viem'
import { defineChain } from 'viem'
import { SIDRA_TOKENS, WSDA_ADDRESS } from '../config/tokens.js'
import {
  quoteSidraBuy,
  quoteSidraSell,
  SIDRA_SWAP_ADDRESS,
} from './sidraSwap.js'

export const sidraChain = defineChain({
  id: 97453,
  name: 'Sidra Chain',
  nativeCurrency: { name: 'Sidra Coin', symbol: 'SDA', decimals: 18 },
  rpcUrls: { default: { http: ['https://node.sidrachain.com'] } },
})

export const publicClient = createPublicClient({
  chain: sidraChain,
  transport: http('https://node.sidrachain.com'),
})

export type QuoteResult = {
  amountIn: string
  amountOut: string
  path: string[]
  routeType: 'wrap' | 'unwrap' | 'router' | 'sidra-buy' | 'sidra-sell'
  minAmountOut: string
  swapAddress?: string
  slippageParam?: string
}

export async function quoteSwap(
  fromSymbol: string,
  toSymbol: string,
  amountIn: string,
  routerAddress: string | null,
  slippageBps: number,
): Promise<QuoteResult> {
  const amountInWei = parseEther(amountIn)
  const sidraSwapAddress = process.env.SIDRA_SWAP_CONTRACT?.trim() || SIDRA_SWAP_ADDRESS

  if (fromSymbol === 'SDA' && toSymbol === 'WSDA') {
    const minOut = (amountInWei * BigInt(10000 - slippageBps)) / 10000n
    return {
      amountIn,
      amountOut: amountIn,
      path: ['native', WSDA_ADDRESS],
      routeType: 'wrap',
      minAmountOut: minOut.toString(),
    }
  }

  if (fromSymbol === 'WSDA' && toSymbol === 'SDA') {
    const minOut = (amountInWei * BigInt(10000 - slippageBps)) / 10000n
    return {
      amountIn,
      amountOut: amountIn,
      path: [WSDA_ADDRESS, 'native'],
      routeType: 'unwrap',
      minAmountOut: minOut.toString(),
    }
  }

  const fromToken = SIDRA_TOKENS.find((t) => t.symbol === fromSymbol)
  const toToken = SIDRA_TOKENS.find((t) => t.symbol === toSymbol)

  if (fromSymbol === 'SDA' && toToken?.address) {
    const quote = await quoteSidraBuy(toToken.address, amountIn, slippageBps)
    return {
      amountIn,
      amountOut: quote.amountOut,
      path: ['native', toToken.address],
      routeType: 'sidra-buy',
      minAmountOut: quote.minAmountOut,
      swapAddress: sidraSwapAddress,
      slippageParam: quote.slippageParam.toString(),
    }
  }

  if (toSymbol === 'SDA' && fromToken?.address) {
    const quote = await quoteSidraSell(fromToken.address, amountIn, slippageBps)
    return {
      amountIn,
      amountOut: quote.amountOut,
      path: [fromToken.address, WSDA_ADDRESS, 'native'],
      routeType: 'sidra-sell',
      minAmountOut: quote.minAmountOut,
      swapAddress: sidraSwapAddress,
      slippageParam: quote.slippageParam.toString(),
    }
  }

  if (fromSymbol === 'WSDA' && toToken?.address) {
    throw new Error(
      'Pay with SDA to buy tokens on the SidraDX pool. Select SDA as the input token.',
    )
  }

  if (toSymbol === 'WSDA' && fromToken?.address) {
    const quote = await quoteSidraSell(fromToken.address, amountIn, slippageBps)
    return {
      amountIn,
      amountOut: quote.amountOut,
      path: [fromToken.address, WSDA_ADDRESS],
      routeType: 'sidra-sell',
      minAmountOut: quote.minAmountOut,
      swapAddress: sidraSwapAddress,
      slippageParam: quote.slippageParam.toString(),
    }
  }

  if (!routerAddress) {
    throw new Error(
      'Swap not configured for this pair. Set SIDRA_SWAP_CONTRACT in .env (Sidra official pool).',
    )
  }

  if (!toToken?.address) {
    throw new Error('Invalid output token')
  }

  let path: Address[]

  if (fromSymbol === 'SDA') {
    path = [WSDA_ADDRESS as Address, toToken.address as Address]
  } else if (toSymbol === 'SDA') {
    if (!fromToken?.address) throw new Error('Invalid input token')
    path = [fromToken.address as Address, WSDA_ADDRESS as Address]
  } else {
    if (!fromToken?.address) throw new Error('Invalid input token')
    path = [fromToken.address as Address, toToken.address as Address]
  }

  const routerAbi = [
    {
      name: 'getAmountsOut',
      type: 'function',
      stateMutability: 'view',
      inputs: [
        { name: 'amountIn', type: 'uint256' },
        { name: 'path', type: 'address[]' },
      ],
      outputs: [{ name: 'amounts', type: 'uint256[]' }],
    },
  ] as const

  const amounts = await publicClient.readContract({
    address: routerAddress as Address,
    abi: routerAbi,
    functionName: 'getAmountsOut',
    args: [amountInWei, path],
  })

  const amountOutWei = amounts[amounts.length - 1]!
  const minOut = (amountOutWei * BigInt(10000 - slippageBps)) / 10000n

  return {
    amountIn,
    amountOut: (Number(amountOutWei) / 1e18).toString(),
    path: path.map(String),
    routeType: 'router',
    minAmountOut: minOut.toString(),
  }
}
