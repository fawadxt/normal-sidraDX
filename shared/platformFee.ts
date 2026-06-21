import { formatUnits, parseEther } from 'viem'

export const PLATFORM_FEE_TIER_MID_SDA = 300
export const PLATFORM_FEE_TIER_HIGH_SDA = 500
export const PLATFORM_FEE_BPS_LOW = 100
export const PLATFORM_FEE_BPS_MID = 150
export const PLATFORM_FEE_BPS_HIGH = 200

export const PLATFORM_FEE_TIER_DESCRIPTION =
  '1% under 300 SDA · 1.5% at 300–500 SDA · 2% at 500+'

export function getPlatformFeeBps(sdaNotional: number): number {
  if (sdaNotional <= 0) return 0
  if (sdaNotional >= PLATFORM_FEE_TIER_HIGH_SDA) return PLATFORM_FEE_BPS_HIGH
  if (sdaNotional >= PLATFORM_FEE_TIER_MID_SDA) return PLATFORM_FEE_BPS_MID
  return PLATFORM_FEE_BPS_LOW
}

/** SDA value used to pick the fee tier and calculate the platform fee. */
export function getSwapSdaNotional(
  fromToken: string,
  toToken: string,
  amountIn: string,
  amountOut: string,
): number {
  if (fromToken === 'SDA' || fromToken === 'WSDA') return Number(amountIn)
  if (toToken === 'SDA' || toToken === 'WSDA') return Number(amountOut)
  return Number(amountOut)
}

export function calculatePlatformFeeSda(
  fromToken: string,
  toToken: string,
  amountIn: string,
  amountOut: string,
): number {
  const notional = getSwapSdaNotional(fromToken, toToken, amountIn, amountOut)
  if (notional <= 0) return 0
  const bps = getPlatformFeeBps(notional)
  return (notional * bps) / 10_000
}

export function calculatePlatformFeeWei(
  fromToken: string,
  toToken: string,
  amountIn: string,
  amountOut: string,
): bigint {
  const feeSda = calculatePlatformFeeSda(fromToken, toToken, amountIn, amountOut)
  if (feeSda <= 0) return 0n
  return parseEther(feeSda.toFixed(18))
}

export function formatPlatformFeeRate(notional: number): string {
  const bps = getPlatformFeeBps(notional)
  if (bps === PLATFORM_FEE_BPS_HIGH) return '2%'
  if (bps === PLATFORM_FEE_BPS_MID) return '1.5%'
  return '1%'
}

export function formatPlatformFeeSummary(
  fromToken: string,
  toToken: string,
  amountIn: string,
  amountOut: string,
): string {
  const feeSda = calculatePlatformFeeSda(fromToken, toToken, amountIn, amountOut)
  const notional = getSwapSdaNotional(fromToken, toToken, amountIn, amountOut)
  if (feeSda <= 0) return PLATFORM_FEE_TIER_DESCRIPTION
  return `${formatPlatformFeeRate(notional)} platform fee (~${feeSda.toFixed(4)} SDA)`
}

export function maxSdaSwapFromBalance(balanceWei: bigint): string {
  if (balanceWei === 0n) return '0'

  const balance = Number(formatUnits(balanceWei, 18))
  const candidates: number[] = []

  const highTierAmount = balance / (1 + PLATFORM_FEE_BPS_HIGH / 10_000)
  if (highTierAmount >= PLATFORM_FEE_TIER_HIGH_SDA) candidates.push(highTierAmount)

  const midTierAmount = balance / (1 + PLATFORM_FEE_BPS_MID / 10_000)
  if (
    midTierAmount >= PLATFORM_FEE_TIER_MID_SDA &&
    midTierAmount < PLATFORM_FEE_TIER_HIGH_SDA
  ) {
    candidates.push(midTierAmount)
  }

  const lowTierAmount = balance / (1 + PLATFORM_FEE_BPS_LOW / 10_000)
  if (lowTierAmount < PLATFORM_FEE_TIER_MID_SDA) candidates.push(lowTierAmount)

  const amountIn = candidates.length > 0 ? Math.max(...candidates) : lowTierAmount
  const trimmed = amountIn.toFixed(18).replace(/\.?0+$/, '')
  return trimmed === '' ? '0' : trimmed
}
