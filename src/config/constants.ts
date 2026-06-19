export const SWAP_FEE_AMOUNT = '0.1'

// Set your wallet address in .env as VITE_SWAP_FEE_RECIPIENT=0xYourAddress...
export const SWAP_FEE_RECIPIENT = import.meta.env.VITE_SWAP_FEE_RECIPIENT as `0x${string}` | undefined

export const isSwapFeeConfigured =
  !!SWAP_FEE_RECIPIENT && SWAP_FEE_RECIPIENT.startsWith('0x') && SWAP_FEE_RECIPIENT.length === 42
