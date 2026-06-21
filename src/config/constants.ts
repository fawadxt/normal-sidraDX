export const SWAP_FEE_AMOUNT = '1%/1.5%/2%'

export const FEE_ROUTER_ADDRESS = import.meta.env.VITE_FEE_ROUTER_ADDRESS as `0x${string}` | undefined

// Set your wallet address in .env as VITE_SWAP_FEE_RECIPIENT=0xYourAddress...
export const SWAP_FEE_RECIPIENT = import.meta.env.VITE_SWAP_FEE_RECIPIENT as `0x${string}` | undefined

export const isSwapFeeConfigured =
  (!!SWAP_FEE_RECIPIENT &&
    SWAP_FEE_RECIPIENT.startsWith('0x') &&
    SWAP_FEE_RECIPIENT.length === 42) ||
  (!!FEE_ROUTER_ADDRESS && FEE_ROUTER_ADDRESS.startsWith('0x') && FEE_ROUTER_ADDRESS.length === 42)
