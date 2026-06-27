import { createConfig, createStorage, http, type CreateConnectorFn } from 'wagmi'
import { injected, metaMask, walletConnect } from '@wagmi/connectors'
import type { EIP1193Provider } from 'viem'
import { localWallet } from './localWalletConnector'
import { BRAND } from './brand'
import { sidraChain } from './sidraChain'
import { bscChain } from './bscChain'

export { sidraChain, bscChain }

const appUrl = import.meta.env.VITE_APP_URL ?? 'http://localhost:5173'
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const connectors: CreateConnectorFn[] = [
  localWallet(),
  metaMask({
    dappMetadata: {
      name: BRAND.name,
      url: appUrl,
    },
  }),
  injected({
    shimDisconnect: true,
    target: 'metaMask',
  }),
  injected({
    shimDisconnect: true,
    target: 'rabby',
  }),
  injected({
    shimDisconnect: true,
    unstable_shimAsyncInject: 2_000,
    target() {
      if (typeof window === 'undefined') return undefined
      const provider =
        window.safepalProvider ??
        window.safepal ??
        (window.ethereum?.isSafePal ? window.ethereum : undefined)
      if (!provider) return undefined
      return {
        id: 'safepal',
        name: 'SafePal',
        provider: provider as EIP1193Provider,
      }
    },
  }),
  injected({
    shimDisconnect: true,
  }),
]

if (walletConnectProjectId) {
  connectors.push(
    walletConnect({
      projectId: walletConnectProjectId,
      metadata: {
        name: BRAND.name,
        description: BRAND.description,
        url: appUrl,
        icons: [`${appUrl}${BRAND.iconPath}`],
      },
      showQrModal: true,
    }),
  )
}

export const wagmiConfig = createConfig({
  chains: [sidraChain, bscChain],
  connectors,
  storage: createStorage({ storage: localStorage }),
  transports: {
    [sidraChain.id]: http('https://node.sidrachain.com'),
    [bscChain.id]: http('https://bsc-dataseed.binance.org'),
  },
})
