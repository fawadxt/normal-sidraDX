import { BSC_TOKENS } from '../../shared/bscTokens'
import { bscChain } from '../config/bscChain'
import type { SwapToken } from './api'

export function getTokensForChain(chainId: number, sidraTokens: SwapToken[]): SwapToken[] {
  if (chainId === bscChain.id) return BSC_TOKENS
  return sidraTokens
}

export function getNativeSymbol(chainId: number): string {
  return chainId === bscChain.id ? 'BNB' : 'SDA'
}
