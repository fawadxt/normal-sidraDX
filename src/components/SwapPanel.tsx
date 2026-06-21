import { useCallback, useEffect, useRef, useState } from 'react'
import {
  useBalance,
  useReadContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { formatUnits, parseEther, type Address } from 'viem'
import { erc20Abi, feeRouterAbi, wsdaAbi } from '../config/abis'
import { TokenSelect } from './TokenSelect'
import { LoadingLabel } from './LoadingDots'
import { useAppConfig } from '../hooks/useAppConfig'
import { useSwapQuote } from '../hooks/useSwapQuote'
import { useTokenBalances } from '../hooks/useTokenBalances'
import { recordSwap } from '../lib/api'
import type { SwapQuote } from '../lib/api'
import {
  calculatePlatformFeeWei,
  SWAP_FEE_NOTICE,
} from '../../shared/platformFee'
import {
  encodeSidraBuyCall,
  encodeSidraSellCall,
  SIDRA_SWAP_ADDRESS,
} from '../lib/sidraSwap'

const WSDA = '0xE4095a910209D7BE03B55D02F40d4554B1666182' as const

type Props = {
  isConnected: boolean
  address?: Address
  onConnect: () => void
}

type SwapStep = 'idle' | 'fee' | 'approve' | 'swap'

function getEffectiveSwapWei(
  fromToken: string,
  amountIn: string,
  balancesWei: Record<string, bigint>,
): bigint {
  const requested = parseEther(amountIn || '0')
  if (fromToken === 'SDA') return requested
  const available = balancesWei[fromToken] ?? 0n
  return requested > available ? available : requested
}

function routeLabel(routeType?: SwapQuote['routeType']): string {
  switch (routeType) {
    case 'wrap':
      return 'Wrap SDA → WSDA'
    case 'unwrap':
      return 'Unwrap WSDA → SDA'
    case 'sidra-buy':
      return 'SidraDX pool (SDA → token)'
    case 'sidra-sell':
      return 'SidraDX pool (token → WSDA)'
    case 'router':
      return 'SidraDX pool'
    default:
      return ''
  }
}

export function SwapPanel({ isConnected, address, onConnect }: Props) {
  const { config, feeRecipient, isFeeConfigured } = useAppConfig()
  const [fromToken, setFromToken] = useState('SDA')
  const [toToken, setToToken] = useState('WSDA')
  const [amountIn, setAmountIn] = useState('')
  const [step, setStep] = useState<SwapStep>('idle')
  const [pendingQuote, setPendingQuote] = useState<SwapQuote | null>(null)
  const recordedRef = useRef<string | null>(null)

  const swapAddress = (config.sidraSwapAddress ?? SIDRA_SWAP_ADDRESS) as Address
  const feeRouterAddress = config.feeRouterAddress as Address | null
  const useFeeRouter = !!feeRouterAddress

  const { quote, isLoading: quoteLoading, error: quoteError } = useSwapQuote(
    fromToken,
    toToken,
    amountIn,
  )

  const autoFeeSwap =
    useFeeRouter &&
    (quote?.routeType === 'sidra-buy' || quote?.routeType === 'sidra-sell')
  const swapSpender = (autoFeeSwap ? feeRouterAddress : swapAddress) as Address

  const { data: nativeBalance } = useBalance({ address })
  const { balances, balancesWei, getMaxSwapAmount } = useTokenBalances(address, config.tokens)
  const fromMeta = config.tokens.find((t) => t.symbol === fromToken)
  const toMeta = config.tokens.find((t) => t.symbol === toToken)

  const tokenOptions = (symbols: typeof config.tokens) =>
    symbols.map((t) => ({
      symbol: t.symbol,
      name: t.name,
      balance: isConnected ? balances[t.symbol] : undefined,
    }))

  const needsTokenApproval =
    quote?.routeType === 'sidra-sell' && !!fromMeta?.address && !!address

  const { data: tokenAllowance } = useReadContract({
    address: fromMeta?.address as Address | undefined,
    abi: erc20Abi,
    functionName: 'allowance',
    args:
      needsTokenApproval && address
        ? [address, swapSpender]
        : undefined,
  })

  const swapFeeWei =
    quote && amountIn && Number(amountIn) > 0
      ? calculatePlatformFeeWei(fromToken, toToken, amountIn, quote.amountOut)
      : 0n
  const effectiveSwapWei = getEffectiveSwapWei(fromToken, amountIn, balancesWei)
  const totalNeeded = effectiveSwapWei + (fromToken === 'SDA' ? swapFeeWei : 0n)

  const maxSwapAmount = getMaxSwapAmount(fromToken)
  const canUseMax = isConnected && Number(maxSwapAmount) > 0

  const hasEnoughBalance =
    isConnected &&
    nativeBalance &&
    effectiveSwapWei > 0n &&
    (fromToken === 'SDA'
      ? nativeBalance.value >= totalNeeded
      : (balancesWei[fromToken] ?? 0n) >= effectiveSwapWei &&
        (autoFeeSwap || nativeBalance.value >= swapFeeWei))

  const {
    data: feeTxHash,
    sendTransaction: sendFee,
    isPending: feePending,
    error: feeError,
  } = useSendTransaction()

  const { isLoading: feeConfirming, isSuccess: feeSuccess } = useWaitForTransactionReceipt({
    hash: feeTxHash,
  })

  const {
    data: swapTxHash,
    sendTransaction: sendSwap,
    isPending: swapSendPending,
    error: swapSendError,
  } = useSendTransaction()

  const {
    data: approveTxHash,
    writeContract: approveToken,
    isPending: approvePending,
    error: approveError,
  } = useWriteContract()

  const { isLoading: approveConfirming, isSuccess: approveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveTxHash,
    })

  const {
    data: writeTxHash,
    writeContract,
    isPending: swapWritePending,
    error: swapWriteError,
  } = useWriteContract()

  const activeSwapHash = swapTxHash ?? writeTxHash

  const { isLoading: swapConfirming, isSuccess: swapSuccess } = useWaitForTransactionReceipt({
    hash: activeSwapHash,
  })

  const executeSidraSwap = useCallback(
    (activeQuote: SwapQuote) => {
      if (!address) return

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20)
      const minOut = BigInt(activeQuote.minAmountOut)
      const slippageParam = BigInt(activeQuote.slippageParam ?? '10000')

      if (activeQuote.routeType === 'sidra-buy') {
        if (fromToken !== 'SDA') return

        const token = toMeta?.address as Address
        if (!token) return

        if (autoFeeSwap && feeRouterAddress) {
          const swapSda = parseEther(amountIn)
          writeContract({
            address: feeRouterAddress,
            abi: feeRouterAbi,
            functionName: 'sidraBuyWithFee',
            args: [token, swapSda, minOut, deadline],
            value: swapSda + swapFeeWei,
          })
          return
        }

        sendSwap({
          to: swapAddress,
          value: parseEther(amountIn),
          data: encodeSidraBuyCall(token, slippageParam, minOut, deadline),
        })
        return
      }

      if (activeQuote.routeType === 'sidra-sell') {
        const token = fromMeta?.address as Address
        if (!token) return

        const amountWei = getEffectiveSwapWei(fromToken, amountIn, balancesWei)

        if (autoFeeSwap && feeRouterAddress) {
          writeContract({
            address: feeRouterAddress,
            abi: feeRouterAbi,
            functionName: 'sidraSellWithFee',
            args: [token, amountWei, minOut, deadline],
          })
          return
        }

        sendSwap({
          to: swapAddress,
          data: encodeSidraSellCall(
            token,
            amountWei,
            slippageParam,
            minOut,
            deadline,
          ),
        })
      }
    },
    [
      address,
      amountIn,
      autoFeeSwap,
      balancesWei,
      feeRouterAddress,
      fromMeta?.address,
      fromToken,
      sendSwap,
      swapAddress,
      swapFeeWei,
      toMeta?.address,
      writeContract,
    ],
  )

  const executeWrapSwap = useCallback(
    (activeQuote: SwapQuote) => {
      if (!address) return

      if (activeQuote.routeType === 'wrap') {
        writeContract({
          address: WSDA,
          abi: wsdaAbi,
          functionName: 'deposit',
          value: parseEther(amountIn),
        })
        return
      }

      if (activeQuote.routeType === 'unwrap') {
        writeContract({
          address: WSDA,
          abi: wsdaAbi,
          functionName: 'withdraw',
          args: [parseEther(amountIn)],
        })
      }
    },
    [address, amountIn, writeContract],
  )

  const runSwapStep = useCallback(
    (activeQuote: SwapQuote) => {
      if (activeQuote.routeType === 'sidra-sell') {
        const amountWei = getEffectiveSwapWei(fromToken, amountIn, balancesWei)
        const allowance = tokenAllowance ?? 0n
        if (allowance < amountWei) {
          setStep('approve')
          approveToken({
            address: fromMeta!.address as Address,
            abi: erc20Abi,
            functionName: 'approve',
            args: [swapSpender, amountWei],
          })
          return
        }
      }

      setStep('swap')
      if (activeQuote.routeType === 'wrap' || activeQuote.routeType === 'unwrap') {
        executeWrapSwap(activeQuote)
        return
      }

      executeSidraSwap(activeQuote)
    },
    [
      amountIn,
      approveToken,
      executeSidraSwap,
      executeWrapSwap,
      balancesWei,
      fromMeta,
      swapSpender,
      tokenAllowance,
    ],
  )

  const handleSwapClick = () => {
    if (!isConnected) {
      onConnect()
      return
    }
    if (!amountIn || Number(amountIn) <= 0 || !quote || !isFeeConfigured) return
    if (!hasEnoughBalance || swapFeeWei <= 0n) return
    if (!autoFeeSwap && !feeRecipient) return

    setPendingQuote(quote)
    if (autoFeeSwap) {
      runSwapStep(quote)
      return
    }

    setStep('fee')
    sendFee({ to: feeRecipient!, value: swapFeeWei })
  }

  useEffect(() => {
    if (!feeSuccess || step !== 'fee' || !pendingQuote) return
    runSwapStep(pendingQuote)
  }, [feeSuccess, step, pendingQuote, runSwapStep])

  useEffect(() => {
    if (!approveSuccess || step !== 'approve' || !pendingQuote) return
    setStep('swap')
    executeSidraSwap(pendingQuote)
  }, [approveSuccess, step, pendingQuote, executeSidraSwap])

  useEffect(() => {
    if (!swapSuccess || !address || !amountIn) return
    const recordKey = autoFeeSwap ? activeSwapHash : feeTxHash
    if (!recordKey) return
    if (recordedRef.current === recordKey) return
    recordedRef.current = recordKey

    recordSwap({
      walletAddress: address,
      inputAmount: amountIn,
      outputAmount: quote?.amountOut ?? '0',
      feeAmount: formatUnits(swapFeeWei, 18),
      feeTxHash: recordKey,
      swapTxHash: activeSwapHash ?? undefined,
      fromToken,
      toToken,
    }).catch(() => {})

    setStep('idle')
    setAmountIn('')
    setPendingQuote(null)
  }, [
    swapSuccess,
    autoFeeSwap,
    feeTxHash,
    activeSwapHash,
    address,
    amountIn,
    quote,
    swapFeeWei,
    fromToken,
    toToken,
  ])

  const flipTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
  }

  const handleMaxClick = () => {
    if (!canUseMax) return
    setAmountIn(maxSwapAmount)
  }

  const outputAmount = quote?.amountOut ?? '0.00'
  const isBusy =
    feePending ||
    feeConfirming ||
    approvePending ||
    approveConfirming ||
    swapSendPending ||
    swapWritePending ||
    swapConfirming ||
    step === 'fee' ||
    step === 'swap'

  const activeError = feeError ?? approveError ?? swapSendError ?? swapWriteError

  return (
    <div className="border-t border-slate-900 pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">SidraDX Swap</h4>
        <span className="text-[10px] text-cyan-500 font-bold uppercase">Live liquidity</span>
      </div>

      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            You Pay
          </label>
          {isConnected && balances[fromToken] !== undefined && (
            <span className="text-[10px] font-mono text-slate-500">
              Balance:{' '}
              <span className="text-slate-300 font-bold">
                {balances[fromToken]} {fromToken}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="0.0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            className="bg-transparent text-2xl font-black focus:outline-none flex-1 min-w-0 text-slate-100"
          />
          {canUseMax && (
            <button
              type="button"
              onClick={handleMaxClick}
              disabled={isBusy}
              className="px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-[10px] font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-40 cursor-pointer"
            >
              Max
            </button>
          )}
          <TokenSelect
            value={fromToken}
            options={tokenOptions(config.tokens)}
            onChange={setFromToken}
            variant="pay"
          />
        </div>
        {fromToken === 'SDA' && canUseMax && (
          <p className="text-[10px] text-slate-600 mt-2">{SWAP_FEE_NOTICE}</p>
        )}
      </div>

      <div className="flex justify-center -my-2 relative z-10">
        <button
          type="button"
          onClick={flipTokens}
          className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-lg border-2 border-slate-950 cursor-pointer"
        >
          ⇅
        </button>
      </div>

      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
          You Receive
        </label>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-black text-slate-300 flex-1">
            {quoteLoading ? (
              <span className="text-sm">
                <LoadingLabel text="Live pool quote" />
              </span>
            ) : (
              Number(outputAmount).toFixed(4)
            )}
          </div>
          <TokenSelect
            value={toToken}
            options={tokenOptions(config.tokens.filter((t) => t.symbol !== fromToken))}
            onChange={setToToken}
            variant="receive"
          />
        </div>
        {quote?.routeType && (
          <p className="text-[10px] text-slate-500 mt-2 font-mono">
            Route: {routeLabel(quote.routeType)}
          </p>
        )}
      </div>

      {isFeeConfigured && (
        <div
          className="p-3.5 bg-slate-900/90 border border-cyan-900/50 rounded-2xl text-xs text-slate-300 space-y-2"
          role="note"
          aria-live="polite"
        >
          <p className="text-[13px] leading-relaxed text-slate-200 font-medium">
            {SWAP_FEE_NOTICE}
          </p>
          {quote && amountIn && Number(amountIn) > 0 && swapFeeWei > 0n && (
            <div className="pt-2 border-t border-slate-800 space-y-1 font-mono text-[11px] text-slate-400">
              <p>Transaction summary</p>
              <p>
                Estimated swapping fee: ~{Number(formatUnits(swapFeeWei, 18)).toFixed(4)} SDA
              </p>
              {autoFeeSwap && <p>Fee is included in one swap transaction.</p>}
            </div>
          )}
        </div>
      )}

      {!isFeeConfigured && (
        <div className="p-3 bg-amber-950/40 border border-amber-900 text-amber-400 rounded-2xl text-xs font-mono">
          Fee address not configured. Set SWAP_FEE_RECIPIENT in .env
        </div>
      )}

      {quoteError && amountIn && (
        <div className="p-3 bg-amber-950/40 border border-amber-900 text-amber-400 rounded-2xl text-xs">
          {quoteError}
        </div>
      )}

      <button
        type="button"
        onClick={handleSwapClick}
        disabled={
          isBusy ||
          (isConnected &&
            (!amountIn ||
              Number(amountIn) <= 0 ||
              !isFeeConfigured ||
              !quote ||
              !!quoteError ||
              !hasEnoughBalance))
        }
        className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-slate-950 font-extrabold rounded-2xl tracking-wide shadow-md transition-all cursor-pointer"
      >
        {!isConnected
          ? 'Connect Wallet'
          : !amountIn
            ? 'Enter Amount'
            : isBusy
              ? step === 'fee'
                ? <LoadingLabel text="Paying fee" />
                : step === 'approve'
                  ? <LoadingLabel text="Approving token" />
                  : <LoadingLabel text="Swapping on SidraDX" />
              : 'Swap on SidraDX'}
      </button>

      {!hasEnoughBalance && amountIn && Number(amountIn) > 0 && isConnected && (
        <div className="p-3 bg-rose-950/40 border border-rose-900 text-rose-400 rounded-2xl text-xs">
          <p>Insufficient balance for swap + swapping fee.</p>
          <p className="mt-2 text-rose-300/90">{SWAP_FEE_NOTICE}</p>
          {quote && amountIn && swapFeeWei > 0n && (
            <p className="mt-2 font-mono text-rose-300/90">
              Estimated fee: ~{Number(formatUnits(swapFeeWei, 18)).toFixed(4)} SDA
            </p>
          )}
          {fromToken !== 'SDA' && canUseMax && (
            <span className="block mt-1 text-rose-300/90">
              Tip: use the Max button for your full {fromToken} balance.
            </span>
          )}
        </div>
      )}

      {swapSuccess && (autoFeeSwap ? activeSwapHash : feeTxHash) && step === 'idle' && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-900 text-emerald-400 rounded-2xl text-xs font-mono break-all space-y-1">
          <p>Swap complete on Sidra Chain</p>
          {activeSwapHash && <p>Swap tx: {activeSwapHash}</p>}
          {!autoFeeSwap && feeTxHash && <p>Fee tx: {feeTxHash}</p>}
          {autoFeeSwap && <p>Platform fee included in swap tx</p>}
        </div>
      )}

      {activeError && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-900 text-rose-400 rounded-2xl text-xs font-mono break-all">
          {'shortMessage' in activeError
            ? activeError.shortMessage
            : activeError.message}
        </div>
      )}
    </div>
  )
}
