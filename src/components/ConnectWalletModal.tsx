import { useEffect, useState } from 'react'

import { sidraChain } from '../config/sidraChain'

import { MetaMaskIcon } from './icons/MetaMaskIcon'
import { AppLogo } from './AppLogo'

import { ImportWalletFlow } from './ImportWalletFlow'



type WalletOption = {

  id: string

  name: string

}



type Props = {

  open: boolean

  onClose: () => void

  wallets: WalletOption[]

  isConnecting: boolean

  connectError: string | null

  onConnect: (connectorId: string) => void

}



type View = 'main' | 'import' | 'create'



function hasMetaMask() {

  return typeof window !== 'undefined' && !!window.ethereum?.isMetaMask

}



export function ConnectWalletModal({

  open,

  onClose,

  wallets,

  isConnecting,

  connectError,

  onConnect,

}: Props) {

  const [view, setView] = useState<View>('main')

  const hasWalletConnect = wallets.some((w) => w.id === 'walletConnect')

  const metaMaskDetected = hasMetaMask() || wallets.some((w) => w.id === 'metaMaskSDK')

  const injectedWallet = wallets.find((w) => w.id === 'injected')

  const rabbyWallet = wallets.find((w) => w.id === 'io.rabby')



  useEffect(() => {

    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {

      if (e.key === 'Escape') onClose()

    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)

  }, [open, onClose])



  useEffect(() => {

    if (!open) setView('main')

  }, [open])



  if (!open) return null



  if (view === 'import' || view === 'create') {

    return (

      <div

        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"

        onClick={onClose}

      >

        <div

          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden text-slate-900"

          onClick={(e) => e.stopPropagation()}

        >

          <ImportWalletFlow

            mode={view}

            onBack={() => setView('main')}

            onReady={() => onConnect('sidradx-local')}

          />

        </div>

      </div>

    )

  }



  return (

    <div

      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"

      onClick={onClose}

    >

      <div

        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden text-slate-900"

        onClick={(e) => e.stopPropagation()}

      >

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Connect Wallet</h2>
              <p className="text-[11px] text-slate-500 font-medium">SidraDX</p>
            </div>
          </div>

          <button

            type="button"

            onClick={onClose}

            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"

            aria-label="Close"

          >

            ✕

          </button>

        </div>



        <div className="p-3 space-y-2">

          <button

            type="button"

            disabled={isConnecting}

            onClick={() => onConnect('metaMaskSDK')}

            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 disabled:opacity-50 transition-all cursor-pointer text-left"

          >

            <div className="w-11 h-11 rounded-xl bg-[#FFF6F0] flex items-center justify-center shrink-0">

              <MetaMaskIcon className="w-8 h-8" />

            </div>

            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-2">

                <span className="font-bold text-slate-900">MetaMask</span>

                {metaMaskDetected && (

                  <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">

                    Detected

                  </span>

                )}

              </div>

              <p className="text-xs text-slate-500 mt-0.5">Browser extension wallet</p>

            </div>

          </button>



          {rabbyWallet && (

            <button

              type="button"

              disabled={isConnecting}

              onClick={() => onConnect(rabbyWallet.id)}

              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-50 transition-all cursor-pointer text-left"

            >

              <div className="w-11 h-11 rounded-xl bg-indigo-950 flex items-center justify-center text-white text-xs font-black shrink-0">

                R

              </div>

              <div className="flex-1 min-w-0">

                <span className="font-bold text-slate-900">Rabby Wallet</span>

                <p className="text-xs text-slate-500 mt-0.5">Browser extension</p>

              </div>

            </button>

          )}



          {injectedWallet && (

            <button

              type="button"

              disabled={isConnecting}

              onClick={() => onConnect(injectedWallet.id)}

              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer text-left"

            >

              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">

                🌐

              </div>

              <div className="flex-1 min-w-0">

                <span className="font-bold text-slate-900">Browser Wallet</span>

                <p className="text-xs text-slate-500 mt-0.5">Any injected Web3 wallet</p>

              </div>

            </button>

          )}



          {hasWalletConnect && (

            <button

              type="button"

              disabled={isConnecting}

              onClick={() => onConnect('walletConnect')}

              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer text-left"

            >

              <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-black shrink-0">

                WC

              </div>

              <div className="flex-1 min-w-0">

                <span className="font-bold text-slate-900">WalletConnect</span>

                <p className="text-xs text-slate-500 mt-0.5">Mobile wallets via QR code</p>

              </div>

            </button>

          )}



          <div className="pt-2 pb-1">

            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">

              SidraDX Wallet

            </p>

          </div>



          <button

            type="button"

            disabled={isConnecting}

            onClick={() => setView('create')}

            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer text-left"

          >

            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg shrink-0">

              ✨

            </div>

            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-2">

                <span className="font-bold text-slate-900">Create New Wallet</span>

                <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-900 text-white px-2 py-0.5 rounded-full">

                  New

                </span>

              </div>

              <p className="text-xs text-slate-500 mt-0.5">Generate a 12-word recovery phrase</p>

            </div>

          </button>



          <button

            type="button"

            disabled={isConnecting}

            onClick={() => setView('import')}

            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-50 transition-all cursor-pointer text-left"

          >

            <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-lg shrink-0">

              🔑

            </div>

            <div className="flex-1 min-w-0">

              <span className="font-bold text-slate-900">Import Wallet</span>

              <p className="text-xs text-slate-500 mt-0.5">Private key or seed phrase — stored locally</p>

            </div>

          </button>

        </div>



        {connectError && (

          <div className="mx-3 mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-mono break-all">

            {connectError}

          </div>

        )}



        {isConnecting && (

          <div className="mx-3 mb-3 p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl text-xs text-center">

            Connecting… approve the request in your wallet.

          </div>

        )}



        <div className="mx-3 mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">

          <p className="text-[11px] text-slate-500 leading-relaxed">

            Network: Sidra Chain (ID {sidraChain.id}) · RPC node.sidrachain.com · Swaps use SidraDX

            liquidity

          </p>

        </div>

      </div>

    </div>

  )

}


