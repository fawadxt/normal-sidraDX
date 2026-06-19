import { useCallback, useEffect, useRef, useState } from 'react'
import { useAccount, useConnect, useConnectors, useSwitchChain } from 'wagmi'
import { numberToHex } from 'viem'
import { sidraChain } from '../config/sidraChain'
import { hasStoredWallet } from '../lib/walletStorage'

function getConnectErrorMessage(error: Error | null): string | null {
  if (!error) return null

  const message =
    'shortMessage' in error ? String(error.shortMessage) : error.message

  const lower = message.toLowerCase()
  if (
    lower.includes('user closed') ||
    lower.includes('user rejected') ||
    lower.includes('rejected the request')
  ) {
    return null
  }

  if (lower.includes('provider not found')) {
    return 'No wallet extension found. Install MetaMask or Rabby, then refresh.'
  }

  return message
}

async function addSidraChain(provider: {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}) {
  await provider.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: numberToHex(sidraChain.id),
        chainName: sidraChain.name,
        nativeCurrency: sidraChain.nativeCurrency,
        rpcUrls: sidraChain.rpcUrls.default.http,
        blockExplorerUrls: [sidraChain.blockExplorers.default.url],
      },
    ],
  })
}

export function useWalletConnect() {
  const connectors = useConnectors()
  const { address, isConnected, chain, chainId } = useAccount()
  const { connect, isPending, error, reset } = useConnect()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()
  const [localError, setLocalError] = useState<string | null>(null)
  const chainSwitchAttempted = useRef(false)

  const availableWallets = connectors.map((c) => ({
    id: c.id,
    name: c.name,
    connector: c,
  }))

  const handleConnect = useCallback(
    async (connectorId?: string) => {
      setLocalError(null)
      reset()

      const connector =
        (connectorId ? connectors.find((c) => c.id === connectorId) : undefined) ??
        connectors.find((c) => c.id === 'metaMaskSDK') ??
        connectors.find((c) => c.id === 'io.metamask') ??
        connectors.find((c) => c.id === 'io.rabby') ??
        connectors.find((c) => c.id === 'injected') ??
        connectors[0]

      if (!connector) {
        setLocalError('No wallet connector available. Refresh the page and try again.')
        return
      }

      if (connector.id !== 'metaMaskSDK' && connector.id !== 'walletConnect' && connector.id !== 'sidradx-local') {
        try {
          const provider = await connector.getProvider()
          if (!provider) {
            setLocalError(
              `No ${connector.name} provider found. Try the MetaMask button or install the extension.`,
            )
            return
          }
        } catch {
          setLocalError(
            'Wallet provider not ready. Try the MetaMask button or refresh the page.',
          )
          return
        }
      }

      connect(
        { connector, chainId: sidraChain.id },
        {
          onSuccess: (data) => {
            if (data.chainId === sidraChain.id) return

            switchChain(
              { chainId: sidraChain.id },
              {
                onError: async () => {
                  try {
                    const provider = await connector.getProvider()
                    if (
                      provider &&
                      typeof provider === 'object' &&
                      'request' in provider
                    ) {
                      await addSidraChain(
                        provider as {
                          request: (args: {
                            method: string
                            params?: unknown[]
                          }) => Promise<unknown>
                        },
                      )
                      switchChain({ chainId: sidraChain.id })
                    }
                  } catch {
                    setLocalError(
                      'Connected, but Sidra Chain is not in your wallet. Add network manually (Chain ID: 97453).',
                    )
                  }
                },
              },
            )
          },
          onError: (err) => {
            setLocalError(getConnectErrorMessage(err))
          },
        },
      )
    },
    [connect, connectors, reset, switchChain],
  )

  useEffect(() => {
    if (!isConnected || !chainId || chainId === sidraChain.id) {
      chainSwitchAttempted.current = false
      return
    }

    if (chainSwitchAttempted.current) return
    chainSwitchAttempted.current = true

    switchChain(
      { chainId: sidraChain.id },
      {
        onError: () => {
          setLocalError('Please switch your wallet to Sidra Chain (ID: 97453).')
        },
      },
    )
  }, [isConnected, chainId, switchChain])

  useEffect(() => {
    if (isConnected) return
    if (!hasStoredWallet()) return

    const localConnector = connectors.find((c) => c.id === 'sidradx-local')
    if (!localConnector) return

    connect(
      { connector: localConnector, chainId: sidraChain.id },
      {
        onError: (err) => {
          console.warn('Auto-connect skipped:', err.message)
        },
      },
    )
  }, [connect, connectors, isConnected])

  const connectError = localError ?? getConnectErrorMessage(error)
  const isConnecting = isPending || isSwitchingChain

  return {
    address,
    isConnected,
    chain,
    chainId,
    availableWallets,
    handleConnect,
    isConnecting,
    connectError,
    isWrongChain: isConnected && chainId !== sidraChain.id,
  }
}
