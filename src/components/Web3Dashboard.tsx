import React, { useEffect, useState } from 'react'
import {
  useDisconnect,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { parseEther, formatUnits, type Address } from 'viem'
import { ConnectWalletModal } from './ConnectWalletModal'
import { NavIcon } from './NavIcon'
import { SwapPanel } from './SwapPanel'
import { useAppConfig } from '../hooks/useAppConfig'
import { useWalletConnect } from '../hooks/useWalletConnect'
import { erc20Abi } from '../config/abis'

type TabId = 'assets' | 'send' | 'receive'

export default function Web3Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('assets')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [walletModalOpen, setWalletModalOpen] = useState(false)

  const { config } = useAppConfig()
  const {
    address,
    isConnected,
    chain,
    availableWallets,
    handleConnect,
    isConnecting,
    connectError,
    isWrongChain,
  } = useWalletConnect()
  const { disconnect } = useDisconnect()

  const { data: nativeBalance, isLoading: isNativeLoading } = useBalance({ address })

  const { data: tokenBalanceRaw, isLoading: isTokenLoading } = useReadContract({
    address: config.tokenAddress as Address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: txHash, error: contractError, isPending: isTxPending, writeContract } =
    useWriteContract()

  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const formattedNativeBalance = nativeBalance
    ? formatUnits(nativeBalance.value, nativeBalance.decimals)
    : null

  useEffect(() => {
    if (isConnected) setWalletModalOpen(false)
  }, [isConnected])

  const openWalletModal = () => setWalletModalOpen(true)

  const handleTokenTransfer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient || !amount) return

    writeContract({
      address: config.tokenAddress as Address,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [recipient as Address, parseEther(amount)],
    })
  }

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}
          />
          <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
            {isConnected && chain ? chain.name : 'Network Disconnected'}
          </span>
        </div>

        {isConnected && address ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300">
              {truncateAddress(address)}
            </span>
            <button
              type="button"
              onClick={() => disconnect()}
              className="text-xs font-semibold text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 px-3 py-1.5 rounded-xl border border-rose-900/50 transition-all cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openWalletModal}
            className="text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90 px-4 py-2 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Connect Wallet
          </button>
        )}
      </header>

      <ConnectWalletModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        wallets={availableWallets}
        isConnecting={isConnecting}
        connectError={connectError}
        onConnect={handleConnect}
      />

      <main className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center justify-start">
        <div className="w-full max-w-md space-y-4">
          {isWrongChain && (
            <div className="p-3 bg-amber-950/40 border border-amber-900 text-amber-400 rounded-xl text-xs text-center">
              Wrong network. Please switch to Sidra Chain (97453) in your wallet.
            </div>
          )}

          <div className="bg-slate-950 rounded-3xl border border-slate-800/80 shadow-2xl p-6 relative">
            {activeTab === 'assets' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Native Node Core
                  </h3>
                  {isNativeLoading ? (
                    <div className="h-10 w-40 bg-slate-800 rounded-xl animate-pulse my-2" />
                  ) : (
                    <div className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                      {formattedNativeBalance
                        ? parseFloat(formattedNativeBalance).toFixed(4)
                        : '0.00'}
                      <span className="text-lg font-bold text-cyan-400 ml-2">
                        {nativeBalance?.symbol}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-900 pt-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Tracked Smart Tokens
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/50 flex items-center justify-center font-black text-xs">
                          {nativeBalance?.symbol || 'SDA'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-200">
                            {chain?.nativeCurrency.name || 'Native Engine'}
                          </div>
                          <div className="text-[11px] text-slate-500">System Native Layer</div>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-sm text-slate-300">
                        {formattedNativeBalance
                          ? parseFloat(formattedNativeBalance).toFixed(2)
                          : '0.00'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/50 flex items-center justify-center font-black text-xs">
                          WSDA
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-200">Wrapped SDA</div>
                          <div className="text-[11px] text-blue-400/80 font-mono truncate max-w-[140px]">
                            {truncateAddress(config.tokenAddress)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-sm text-slate-300">
                        {isTokenLoading ? (
                          <span className="inline-block w-12 h-4 bg-slate-800 rounded animate-pulse" />
                        ) : tokenBalanceRaw ? (
                          parseFloat(formatUnits(tokenBalanceRaw, 18)).toFixed(2)
                        ) : (
                          '0.00'
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <SwapPanel
                  isConnected={isConnected}
                  address={address}
                  onConnect={openWalletModal}
                />
              </div>
            )}

            {activeTab === 'send' && (
              <form onSubmit={handleTokenTransfer} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Target Destination Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 font-mono text-xs border border-slate-800 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-200 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Payload Allocation Value
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-4 pr-16 py-3 bg-slate-900 font-mono text-xs border border-slate-800 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-200 transition-colors"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-400 font-mono bg-blue-950 border border-blue-900 px-2 py-0.5 rounded">
                      WSDA
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    !isConnected ||
                    isTxPending ||
                    isTxConfirming ||
                    !recipient ||
                    !amount
                  }
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-2xl shadow-lg transition-all cursor-pointer mt-2"
                >
                  {!isConnected
                    ? 'Connect Wallet to Send'
                    : isTxPending
                      ? 'Awaiting Wallet Signature...'
                      : isTxConfirming
                        ? 'Awaiting Block Inclusion...'
                        : 'Broadcast Smart Contract Tx'}
                </button>

                {isTxSuccess && (
                  <div className="p-3.5 bg-emerald-950/40 border border-emerald-900 text-emerald-400 rounded-2xl text-xs font-mono break-all">
                    🟢 Tx Verified! Hash: {txHash}
                  </div>
                )}
                {contractError && (
                  <div className="p-3.5 bg-rose-950/40 border border-rose-900 text-rose-400 rounded-2xl text-xs font-mono break-all">
                    🛑 Error:{' '}
                    {'shortMessage' in contractError
                      ? contractError.shortMessage
                      : contractError.message}
                  </div>
                )}
              </form>
            )}

            {activeTab === 'receive' && (
              <div className="flex flex-col items-center text-center space-y-4 py-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl shadow-inner">
                  <div className="w-36 h-36 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center font-mono text-[10px] text-slate-600">
                    [ Matrix Code Map ]
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Your Account Address Target
                  </h4>
                  <p className="text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-slate-400 break-all select-all">
                    {address}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (address) navigator.clipboard.writeText(address)
                  }}
                  disabled={!address}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                >
                  Copy Address Vector
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <nav className="bg-slate-950 border-t border-slate-900 shrink-0 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex max-w-md mx-auto">
          {(
            [
              { id: 'assets', label: 'Assets' },
              { id: 'send', label: 'Send' },
              { id: 'receive', label: 'Receive' },
            ] as const
          ).map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
              }}
              className={`flex-1 flex flex-col items-center justify-center py-3.5 text-[10px] font-bold tracking-widest uppercase transition-all border-t-2 cursor-pointer
                ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400 bg-slate-900/40'
                    : 'border-transparent text-slate-500 hover:text-slate-400'
                }`}
            >
              <span className="mb-1.5">
                <NavIcon name={tab.id} active={activeTab === tab.id} />
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
