import { createConnector } from '@wagmi/core'
import {
  type Account,
  type Address,
  type EIP1193RequestFn,
  type Hex,
  createWalletClient,
  custom,
  fromHex,
  http,
  numberToHex,
  SwitchChainError,
} from 'viem'
import { ChainNotConfiguredError, ConnectorNotConnectedError } from '@wagmi/core'
import { sidraChain } from './sidraChain'
import { accountFromStoredSecret, clearStoredPrivateKey } from '../lib/walletStorage'

let activeAccount: Account | null = null
let connected = false
let connectedChainId: number = sidraChain.id

export function setActiveLocalAccount(account: Account | null) {
  activeAccount = account
}

localWallet.type = 'localWallet' as const

export function localWallet() {
  return createConnector((config) => ({
    id: 'sidradx-local',
    name: 'SidraDX Wallet',
    type: localWallet.type,

    async connect({ chainId } = {}) {
      if (!activeAccount) {
        activeAccount = await accountFromStoredSecret()
      }

      if (!activeAccount) {
        throw new Error('Import or create a wallet first.')
      }

      connected = true
      connectedChainId = chainId ?? sidraChain.id

      return {
        accounts: [activeAccount.address] as readonly Address[],
        chainId: connectedChainId,
      } as never
    },

    async disconnect() {
      connected = false
      activeAccount = null
      clearStoredPrivateKey()
    },

    async getAccounts() {
      if (!connected || !activeAccount) throw new ConnectorNotConnectedError()
      return [activeAccount.address]
    },

    async getChainId() {
      return connectedChainId
    },

    async isAuthorized() {
      if (connected && activeAccount) return true
      const stored = await accountFromStoredSecret()
      return !!stored
    },

    async switchChain({ chainId }) {
      const chain = config.chains.find((x) => x.id === chainId)
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError())
      connectedChainId = chainId
      config.emitter.emit('change', { chainId })
      return chain
    },

    onAccountsChanged() {
      this.onDisconnect()
    },

    onChainChanged(chain) {
      connectedChainId = Number(chain)
      config.emitter.emit('change', { chainId: connectedChainId })
    },

    async onDisconnect() {
      connected = false
      config.emitter.emit('disconnect')
    },

    async getProvider() {
      if (!activeAccount) {
        activeAccount = await accountFromStoredSecret()
      }

      const account = activeAccount
      const chain =
        config.chains.find((x) => x.id === connectedChainId) ?? config.chains[0]
      const rpcUrl = chain.rpcUrls.default.http[0]!

      const walletClient = createWalletClient({
        account: account ?? undefined,
        chain,
        transport: http(rpcUrl),
      })

      const request = (async ({ method, params }) => {
        if (method === 'eth_chainId') return numberToHex(connectedChainId)
        if (method === 'eth_accounts' || method === 'eth_requestAccounts') {
          if (!account) return []
          return [account.address]
        }

        if (method === 'wallet_switchEthereumChain') {
          type Params = [{ chainId: Hex }]
          connectedChainId = fromHex((params as Params)[0].chainId, 'number')
          config.emitter.emit('change', { chainId: connectedChainId })
          return null
        }

        if (!account) throw new ConnectorNotConnectedError()

        if (method === 'eth_sendTransaction') {
          type TxParams = {
            from?: Address
            to?: Address
            value?: Hex
            data?: Hex
            gas?: Hex
          }
          const tx = (params as [TxParams])[0]
          return walletClient.sendTransaction({
            account,
            chain,
            to: tx.to,
            value: tx.value ? fromHex(tx.value, 'bigint') : undefined,
            data: tx.data,
            gas: tx.gas ? fromHex(tx.gas, 'bigint') : undefined,
          })
        }

        if (method === 'personal_sign' || method === 'eth_sign') {
          const [message] = params as [Hex, Address]
          return walletClient.signMessage({ account, message })
        }

        throw new Error(`Unsupported method: ${method}`)
      }) as EIP1193RequestFn

      return custom({ request })({ retryCount: 0 }) as never
    },
  }))
}
