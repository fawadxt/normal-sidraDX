import { createConfig, createStorage, http, type CreateConnectorFn } from 'wagmi'
import { injected, metaMask, walletConnect } from '@wagmi/connectors'
import { localWallet } from './localWalletConnector'
import { sidraChain } from './sidraChain'

export { sidraChain }

const appUrl = import.meta.env.VITE_APP_URL ?? 'http://localhost:5173'
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const connectors: CreateConnectorFn[] = [
  localWallet(),
  metaMask({
    dappMetadata: {
      name: 'SidraDX',
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
  }),
]

if (walletConnectProjectId) {
  connectors.push(
    walletConnect({
      projectId: walletConnectProjectId,
      metadata: {
        name: 'SidraDX',
        description: 'Sidra Chain DEX Wallet',
        url: appUrl,
        icons: [`${appUrl}/favicon.svg`],
      },
      showQrModal: true,
    }),
  )
}

export const wagmiConfig = createConfig({
  chains: [sidraChain],
  connectors,
  storage: createStorage({ storage: localStorage }),
  transports: {
    [sidraChain.id]: http('https://node.sidrachain.com'),
  },
})
