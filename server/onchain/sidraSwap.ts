import {
  createPublicClient,
  decodeAbiParameters,
  decodeEventLog,
  encodeFunctionData,
  formatUnits,
  http,
  parseAbiItem,
  parseEther,
  type Address,
  type Hex,
} from 'viem'
import { defineChain } from 'viem'

export const SIDRA_SWAP_ADDRESS =
  (process.env.SIDRA_SWAP_CONTRACT?.trim() ||
    '0xF4B3E8281e1Af643c6Db379FDE67938a4Ce1F822') as Address

export const SIDRA_SWAP_BUY_SELECTOR = '0xdde6379f' as Hex
export const SIDRA_SWAP_SELL_SELECTOR = '0x968e7276' as Hex

export const SIDRA_SWAP_SLIPPAGE_PARAM = BigInt(
  process.env.SIDRA_SWAP_SLIPPAGE_PARAM ?? 10000,
)

const EXPLORER_API = 'https://ledger.sidrachain.com/api/v2'
const WSDA = '0xe4095a910209d7be03b55d02f40d4554b1666182'

const sidraChain = defineChain({
  id: 97453,
  name: 'Sidra Chain',
  nativeCurrency: { name: 'Sidra Coin', symbol: 'SDA', decimals: 18 },
  rpcUrls: { default: { http: ['https://node.sidrachain.com'] } },
})

const publicClient = createPublicClient({
  chain: sidraChain,
  transport: http('https://node.sidrachain.com'),
})

const transferEvent = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)

type TokenRate = {
  tokenPerSda: number
  source: 'buy' | 'sell' | 'simulated'
}

function normalizeAddress(address: string): string {
  return address.toLowerCase()
}

export function encodeSidraBuyCall(
  token: Address,
  slippageParam: bigint,
  minOut: bigint,
  deadline: bigint,
): Hex {
  const encoded = encodeFunctionData({
    abi: [
      {
        name: 'sidraBuy',
        type: 'function',
        inputs: [
          { type: 'address' },
          { type: 'uint256' },
          { type: 'uint256' },
          { type: 'uint256' },
        ],
        outputs: [],
      },
    ],
    functionName: 'sidraBuy',
    args: [token, slippageParam, minOut, deadline],
  })

  return `${SIDRA_SWAP_BUY_SELECTOR}${encoded.slice(10)}` as Hex
}

export function encodeSidraSellCall(
  token: Address,
  amountIn: bigint,
  slippageParam: bigint,
  minOut: bigint,
  deadline: bigint,
): Hex {
  const encoded = encodeFunctionData({
    abi: [
      {
        name: 'sidraSell',
        type: 'function',
        inputs: [
          { type: 'address' },
          { type: 'uint256' },
          { type: 'uint256' },
          { type: 'uint256' },
          { type: 'uint256' },
        ],
        outputs: [],
      },
    ],
    functionName: 'sidraSell',
    args: [token, amountIn, slippageParam, minOut, deadline],
  })

  return `${SIDRA_SWAP_SELL_SELECTOR}${encoded.slice(10)}` as Hex
}

type SwapTx = { hash: string; raw_input: string; from: string | { hash: string } }

let rateCache: { at: number; rates: Map<string, TokenRate> } = {
  at: 0,
  rates: new Map(),
}
const CACHE_MS = 30 * 60 * 1000
const EXPLORER_MAX_PAGES = 4

function ensureCacheFresh(): void {
  if (Date.now() - rateCache.at < CACHE_MS) return
  rateCache = { at: Date.now(), rates: new Map() }
}

function txSender(from: string | { hash: string }): string {
  return typeof from === 'string' ? from : from.hash
}

async function fetchExplorerPage(
  nextParams: Record<string, string> | null,
): Promise<{ items: SwapTx[]; next: Record<string, string> | null }> {
  let url = `${EXPLORER_API}/addresses/${SIDRA_SWAP_ADDRESS}/transactions?filter=to`
  if (nextParams) {
    url += `&${new URLSearchParams(nextParams).toString()}`
  }

  const response = await fetch(url)
  if (!response.ok) return { items: [], next: null }

  const json = (await response.json()) as {
    items?: SwapTx[]
    next_page_params?: Record<string, string> | null
  }

  return { items: json.items ?? [], next: json.next_page_params ?? null }
}

function parseSellRate(rawInput: string): { token: string; rate: TokenRate } | null {
  if (!rawInput.startsWith('0x968e7276')) return null

  try {
    const params = decodeAbiParameters(
      [
        { type: 'address' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'uint256' },
      ],
      (`0x${rawInput.slice(10)}`) as `0x${string}`,
    )
    const token = normalizeAddress(params[0] as string)
    const tokenIn = Number(formatUnits(params[1] as bigint, 18))
    const minWsdaOut = Number(formatUnits(params[3] as bigint, 18))
    if (tokenIn <= 0 || minWsdaOut <= 0) return null

    return {
      token,
      rate: { tokenPerSda: (tokenIn / minWsdaOut) * 0.99, source: 'sell' },
    }
  } catch {
    return null
  }
}

async function findSellRateFromExplorer(tokenKey: string): Promise<TokenRate | null> {
  let next: Record<string, string> | null = null

  for (let page = 0; page < EXPLORER_MAX_PAGES; page++) {
    const { items, next: nextPage } = await fetchExplorerPage(next)
    for (const tx of items) {
      const parsed = parseSellRate(tx.raw_input)
      if (parsed?.token === tokenKey) return parsed.rate
    }
    next = nextPage
    if (!next) break
  }

  return null
}

async function findBuyRateFromExplorer(tokenKey: string): Promise<TokenRate | null> {
  let next: Record<string, string> | null = null

  for (let page = 0; page < EXPLORER_MAX_PAGES; page++) {
    const { items, next: nextPage } = await fetchExplorerPage(next)

    for (const tx of items) {
      const input = tx.raw_input
      if (!input?.startsWith('0xdde6379f')) continue

      try {
        const params = decodeAbiParameters(
          [{ type: 'address' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'uint256' }],
          (`0x${input.slice(10)}`) as `0x${string}`,
        )
        const token = normalizeAddress(params[0] as string)
        if (token !== tokenKey) continue

        const onchainTx = await publicClient.getTransaction({ hash: tx.hash as `0x${string}` })
        const receipt = await publicClient.getTransactionReceipt({ hash: tx.hash as `0x${string}` })
        const sdaIn = Number(formatUnits(onchainTx.value, 18))
        if (sdaIn <= 0) continue

        let tokenOut = 0
        const sender = txSender(tx.from).toLowerCase()

        for (const log of receipt.logs) {
          if (normalizeAddress(log.address) === WSDA) continue
          try {
            const event = decodeEventLog({
              abi: [transferEvent],
              data: log.data,
              topics: log.topics,
            })
            if (
              normalizeAddress(log.address) === token &&
              event.args.to.toLowerCase() === sender
            ) {
              tokenOut += Number(formatUnits(event.args.value, 18))
            }
          } catch {
            // ignore non-transfer logs
          }
        }

        if (tokenOut > 0) {
          return { tokenPerSda: tokenOut / sdaIn, source: 'buy' }
        }
      } catch {
        // try next matching tx
      }
    }

    next = nextPage
    if (!next) break
  }

  return null
}

async function simulateBuyOutput(tokenAddress: string, amountInSda: string): Promise<bigint> {
  const value = parseEther(amountInSda)
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20)
  const token = tokenAddress as Address
  const maxOut = parseEther(String(Math.max(Number(amountInSda) * 50, 5)))

  async function callSucceeds(minOut: bigint): Promise<boolean> {
    const data = encodeSidraBuyCall(token, SIDRA_SWAP_SLIPPAGE_PARAM, minOut, deadline)
    try {
      await publicClient.call({
        to: SIDRA_SWAP_ADDRESS,
        data,
        value,
      })
      return true
    } catch {
      return false
    }
  }

  let lo = 0n
  let hi = 1n

  while (hi < maxOut && (await callSucceeds(hi))) {
    lo = hi
    hi *= 2n
  }

  if (hi >= maxOut) {
    hi = maxOut
  }

  while (lo < hi) {
    const mid = (lo + hi + 1n) / 2n
    if (await callSucceeds(mid)) {
      lo = mid
    } else {
      hi = mid - 1n
    }
  }

  return lo
}

async function getTokenRate(tokenAddress: string): Promise<TokenRate> {
  const key = normalizeAddress(tokenAddress)
  ensureCacheFresh()

  const cached = rateCache.rates.get(key)
  if (cached) return cached

  const fromSell = await findSellRateFromExplorer(key)
  if (fromSell) {
    rateCache.rates.set(key, fromSell)
    return fromSell
  }

  const fromBuy = await findBuyRateFromExplorer(key)
  if (fromBuy) {
    rateCache.rates.set(key, fromBuy)
    return fromBuy
  }

  const simulatedOut = await simulateBuyOutput(tokenAddress, '1')
  if (simulatedOut === 0n) {
    throw new Error(
      'SidraDX swap simulation failed for this token. It may not be listed in the Sidra pool yet.',
    )
  }

  const simulated: TokenRate = {
    tokenPerSda: Number(formatUnits(simulatedOut, 18)),
    source: 'simulated',
  }
  rateCache.rates.set(key, simulated)
  return simulated
}

export async function quoteSidraBuy(
  tokenAddress: string,
  amountInSda: string,
  slippageBps: number,
): Promise<{ amountOut: string; minAmountOut: string; slippageParam: bigint }> {
  const rate = await getTokenRate(tokenAddress)
  const amountIn = Number(amountInSda)
  const amountOut = amountIn * rate.tokenPerSda
  const amountOutWei = parseEther(amountOut.toFixed(18))
  const minOut = (amountOutWei * BigInt(10000 - slippageBps)) / 10000n

  return {
    amountOut: amountOut.toString(),
    minAmountOut: minOut.toString(),
    slippageParam: SIDRA_SWAP_SLIPPAGE_PARAM,
  }
}

function estimateWsdaFromSell(tokenIn: number, rate: TokenRate): number {
  if (rate.source === 'sell') {
    // tokenPerSda = (tokenIn / minWsda) * 0.99  →  minWsda ≈ tokenIn / tokenPerSda * 0.99
    return (tokenIn / rate.tokenPerSda) * 0.99
  }
  // Buy/simulated rate: apply pool fee haircut so minOut is not too aggressive
  return (tokenIn / rate.tokenPerSda) * 0.97
}

function sellMinOutMultiplierBps(tokenIn: number): bigint {
  if (tokenIn <= 50) return 9000n
  if (tokenIn <= 250) return 7500n
  if (tokenIn <= 1000) return 6000n
  if (tokenIn <= 5000) return 5000n
  return 4200n
}

export async function quoteSidraSell(
  tokenAddress: string,
  amountIn: string,
  slippageBps: number,
): Promise<{ amountOut: string; minAmountOut: string; slippageParam: bigint }> {
  const rate = await getTokenRate(tokenAddress)
  const tokenIn = Number(amountIn)
  const wsdaOut = estimateWsdaFromSell(tokenIn, rate)
  const wsdaOutWei = parseEther(wsdaOut.toFixed(18))
  const sellSlippageBps = Math.max(slippageBps, 1500)
  const minOut =
    (((wsdaOutWei * BigInt(10000 - sellSlippageBps)) / 10000n) *
      sellMinOutMultiplierBps(tokenIn)) /
    10000n

  return {
    amountOut: wsdaOut.toString(),
    minAmountOut: minOut.toString(),
    slippageParam: SIDRA_SWAP_SLIPPAGE_PARAM,
  }
}
