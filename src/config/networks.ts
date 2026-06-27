import { sidraChain } from '../config/sidraChain'
import { bscChain } from '../config/bscChain'

export const SUPPORTED_CHAINS = [sidraChain, bscChain] as const

export function getChainById(chainId: number) {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId)
}

export function getChainName(chainId: number): string {
  return getChainById(chainId)?.name ?? `Chain ${chainId}`
}
