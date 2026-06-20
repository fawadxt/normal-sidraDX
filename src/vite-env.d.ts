/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SWAP_FEE_RECIPIENT?: string
  readonly VITE_API_URL?: string
  readonly VITE_APP_URL?: string
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface EthereumProvider {
  isMetaMask?: boolean
  isSafePal?: boolean
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

interface Window {
  ethereum?: EthereumProvider
  safepalProvider?: EthereumProvider
  safepal?: EthereumProvider
}
