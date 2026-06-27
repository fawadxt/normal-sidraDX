/** Deterministic colors + paths for Sidra / BSC token avatars */

const PALETTE: [string, string][] = [
  ['#1E4A7A', '#4A7FD4'],
  ['#0F766E', '#2DD4BF'],
  ['#7C2D12', '#F97316'],
  ['#4C1D95', '#A78BFA'],
  ['#831843', '#F472B6'],
  ['#134E4A', '#14B8A6'],
  ['#713F12', '#FBBF24'],
  ['#1E3A5F', '#60A5FA'],
  ['#365314', '#A3E635'],
  ['#581C87', '#C084FC'],
  ['#7F1D1D', '#F87171'],
  ['#164E63', '#22D3EE'],
  ['#422006', '#D97706'],
  ['#312E81', '#818CF8'],
  ['#14532D', '#4ADE80'],
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function tokenGradient(symbol: string): [string, string] {
  const key = symbol.toUpperCase()
  return PALETTE[hashString(key) % PALETTE.length]!
}

export function tokenIconLabel(symbol: string): string {
  const key = symbol.toUpperCase()
  if (key.length <= 4) return key
  return key.slice(0, 4)
}

export function getLocalTokenIconPath(symbol: string): string {
  return `/tokens/${symbol.toUpperCase()}.png`
}

/** Official Sidra Chain mark — https://www.sidrachain.com/icon.png */
export const SIDRA_CHAIN_LOGO_URL = 'https://www.sidrachain.com/icon.png'
