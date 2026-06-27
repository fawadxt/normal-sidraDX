import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  useAccount,
  useBalance,
  useReadContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { formatUnits, parseEther, type Address } from 'viem'
import { erc20Abi, feeRouterAbi, wsdaAbi } from '../config/abis'
import { TokenSelect } from './TokenSelect'
import { SwapAmountShortcuts } from './wallet/SwapAmountShortcuts'
import { SwapQuickPairs } from './wallet/SwapQuickPairs'
import { SwapSlippagePicker } from './wallet/SwapSlippagePicker'
import { LoadingLabel } from './LoadingDots'
import { TxExplorerLink } from './TxExplorerLink'
import { useAppConfig } from '../hooks/useAppConfig'
import { useSwapQuote } from '../hooks/useSwapQuote'
import { useTokenBalances, trimAmountInput } from '../hooks/useTokenBalances'
import { useWalletSettings } from '../hooks/useWalletSettings'
import { recordSwap } from '../lib/api'
import { useWalletNotifications } from '../context/WalletNotificationsContext'
import type { SwapQuote } from '../lib/api'
import {
  calculatePlatformFeeWei,
  platformFeeWeiFromNotionalWei,
  SWAP_FEE_NOTICE,
} from '../../shared/platformFee'
import {
  encodeSidraBuyCall,
  encodeSidraSellCall,
  SIDRA_SWAP_ADDRESS,
} from '../lib/sidraSwap'
import { BRAND } from '../config/brand'

const WSDA = '0xE4095a910209D7BE03B55D02F40d4554B1666182' as const

type Props = {
  isConnected: boolean
  address?: Address
  onConnect: () => void
  isWrongChain?: boolean
  onSwitchNetwork?: () => void
  isSwitchingNetwork?: boolean
  /** `wallet` = gold premium shell; `embedded` = legacy dark dashboard embed */
  appearance?: 'embedded' | 'wallet'
}

type SwapStep = 'idle' | 'fee' | 'approve' | 'swap'

type LastSwapResult = {
  status: 'success' | 'error'
  feeTxHash?: `0x${string}`
  swapTxHash?: `0x${string}`
  feeBundledInSwap?: boolean
  errorMessage?: string
}

/**
 * Hidden cushion on sell minOut only (not shown in the UI quote).
 * Displayed rate matches Sidra pool; wallet accepts a lower floor so the tx does not revert.
 */
function sellExecutionCushionBps(quote: SwapQuote): number {
  const outSda = Number(quote.amountOut)
  if (outSda >= 500) return 2200
  if (outSda >= 100) return 1500
  if (outSda >= 25) return 1000
  if (outSda >= 5) return 600
  return 400
}

function minOutForExecution(quote: SwapQuote): bigint {
  const quoted = BigInt(quote.minAmountOut)
  if (quote.routeType !== 'sidra-sell') return quoted
  const cushionBps = sellExecutionCushionBps(quote)
  return (quoted * BigInt(10000 - cushionBps)) / 10000n
}

const GAS_RESERVE_WEI = parseEther('0.05')

function swapUi(appearance: 'embedded' | 'wallet') {
  if (appearance === 'wallet') {
    return {
      root: 'space-y-4',
      showHeader: false,
      card: 'wallet-surface-elevated p-4 rounded-[var(--premium-radius-xl)]',
      label: 'text-[11px] font-semibold text-[var(--premium-text-muted)] uppercase tracking-widest',
      balance: 'text-[10px] font-mono text-[var(--premium-text-muted)]',
      balanceVal: 'text-[var(--premium-text)] font-bold',
      input:
        'bg-transparent text-2xl font-semibold focus:outline-none flex-1 min-w-0 text-[var(--premium-text)]',
      output: 'text-2xl font-semibold text-[var(--premium-text)] flex-1 min-w-0 truncate',
      maxBtn: 'swap-max-btn disabled:opacity-40',
      flipBtn:
        'w-10 h-10 rounded-2xl bg-[#D4AF37] text-[#1a1200] flex items-center justify-center font-bold shadow-[0_8px_20px_rgba(212,175,55,0.35)] border-2 border-[var(--premium-surface-solid)] cursor-pointer',
      route: 'text-[10px] text-[var(--premium-text-muted)] mt-2 font-mono',
      feeBox: 'swap-fee-box space-y-2 text-xs',
      feeTitle: 'swap-fee-title',
      feeDetail: 'swap-fee-detail space-y-1',
      warn: 'swap-alert',
      err: 'swap-error space-y-1',
      errMuted: 'opacity-90',
      statusCard: 'swap-status-card space-y-2',
      statusLabel: 'text-[var(--premium-text-muted)] font-medium',
      statusHint: 'text-[10px] text-[var(--premium-text-muted)] mt-1 opacity-80',
      successCard: 'swap-success-card space-y-2',
      successTitle: 'font-medium',
      errorCard: 'swap-error space-y-2',
      errorMono: 'font-mono break-all',
      ratePill: 'swap-rate-pill',
      primaryBtn: 'swap-primary-btn',
      tokenTheme: 'wallet' as const,
    }
  }

  return {
    root: 'border-t border-slate-900 pt-4 space-y-4',
    showHeader: true,
    card: 'bg-slate-900 p-4 rounded-2xl border border-slate-800',
    label: 'text-[11px] font-bold text-slate-500 uppercase tracking-widest',
    balance: 'text-[10px] font-mono text-slate-500',
    balanceVal: 'text-slate-300 font-bold',
    input: 'bg-transparent text-2xl font-black focus:outline-none flex-1 min-w-0 text-slate-100',
    output: 'text-2xl font-black text-slate-300 flex-1',
    maxBtn:
      'px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-[10px] font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-40 cursor-pointer',
    flipBtn:
      'w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-lg border-2 border-slate-950 cursor-pointer',
    route: 'text-[10px] text-slate-500 mt-2 font-mono',
    feeBox: 'p-3.5 bg-slate-900/90 border border-cyan-900/50 rounded-2xl text-xs text-slate-300 space-y-2',
    feeTitle: 'text-[13px] leading-relaxed text-slate-200 font-medium',
    feeDetail: 'pt-2 border-t border-slate-800 space-y-1 font-mono text-[11px] text-slate-400',
    warn: 'p-3 bg-amber-950/40 border border-amber-900 text-amber-400 rounded-2xl text-xs',
    err: 'p-3 bg-rose-950/40 border border-rose-900 text-rose-400 rounded-2xl text-xs',
    errMuted: 'text-rose-300/90',
    statusCard: 'p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs space-y-2',
    statusLabel: 'text-slate-400 font-medium',
    statusHint: 'text-[10px] text-slate-500 mt-1',
    successCard: 'p-3.5 bg-emerald-950/40 border border-emerald-900 text-emerald-400 rounded-2xl text-xs space-y-2',
    successTitle: 'font-medium text-emerald-300',
    errorCard: 'p-3.5 bg-rose-950/40 border border-rose-900 text-rose-400 rounded-2xl text-xs space-y-2',
    errorMono: 'font-mono break-all',
    ratePill: 'inline-flex items-center rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-mono text-slate-400',
    primaryBtn:
      'w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-slate-950 font-extrabold rounded-2xl tracking-wide shadow-md transition-all cursor-pointer',
    tokenTheme: 'dark' as const,
  }
}

function getInsufficientBalanceMessage(
  fromToken: string,
  amountIn: string,
  effectiveSwapWei: bigint,
  swapFeeWei: bigint,
  nativeBalanceWei: bigint,
  tokenBalanceWei: bigint | undefined,
): string | null {
  const native = formatUnits(nativeBalanceWei, 18)
  const fee = formatUnits(swapFeeWei, 18)
  const gas = formatUnits(GAS_RESERVE_WEI, 18)

  if (fromToken === 'SDA') {
    const totalNeeded = effectiveSwapWei + swapFeeWei + GAS_RESERVE_WEI
    if (nativeBalanceWei < totalNeeded) {
      const swap = formatUnits(effectiveSwapWei, 18)
      return `Need ${formatUnits(totalNeeded, 18)} SDA total (${swap} swap + ${fee} fee + ~${gas} gas). You have ${native} native SDA.`
    }
    return null
  }

  if (tokenBalanceWei === undefined) return null

  if (tokenBalanceWei < effectiveSwapWei) {
    const have = formatUnits(tokenBalanceWei, 18)
    return `Not enough ${fromToken}. You have ${have}, trying to swap ${amountIn}.`
  }

  const feeNeeded = swapFeeWei + GAS_RESERVE_WEI
  if (nativeBalanceWei < feeNeeded) {
    return `Need ${formatUnits(feeNeeded, 18)} native SDA for fee + gas (fee ~${fee} SDA). You have ${native} native SDA. Fee must be paid in SDA, not WSDA — unwrap WSDA first if needed.`
  }

  return null
}

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

export function SwapPanel({
  isConnected,
  address,
  onConnect,
  isWrongChain = false,
  onSwitchNetwork,
  isSwitchingNetwork = false,
  appearance = 'embedded',
}: Props) {
  const ui = swapUi(appearance)
  const { connector } = useAccount()
  const { config, isFeeConfigured } = useAppConfig()
  const { settings, updateSettings } = useWalletSettings()
  const { notifySwapSuccess } = useWalletNotifications()
  const slippageBps = Math.round(settings.defaultSlippage * 100)
  const [fromToken, setFromToken] = useState('SDA')
  const [toToken, setToToken] = useState('WSDA')
  const [amountIn, setAmountIn] = useState('')
  const [step, setStep] = useState<SwapStep>('idle')
  const [pendingQuote, setPendingQuote] = useState<SwapQuote | null>(null)
  const [lastResult, setLastResult] = useState<LastSwapResult | null>(null)
  const [feeDetailsOpen, setFeeDetailsOpen] = useState(false)
  const recordedRef = useRef<string | null>(null)

  useEffect(() => {
    if (fromToken === toToken) {
      const alt = config.tokens.find((t) => t.symbol !== fromToken)
      if (alt) setToToken(alt.symbol)
    }
  }, [fromToken, toToken, config.tokens])

  useEffect(() => {
    setStep('idle')
    setPendingQuote(null)
    setLastResult(null)
    recordedRef.current = null
  }, [fromToken, toToken])

  const feeWalletAddress = config.swapFeeRecipient as Address | null
  const isFeeWalletConnected =
    isConnected &&
    !!address &&
    !!feeWalletAddress &&
    address.toLowerCase() === feeWalletAddress.toLowerCase()

  const swapAddress = (config.sidraSwapAddress ?? SIDRA_SWAP_ADDRESS) as Address
  const feeRouterAddress = config.feeRouterAddress as Address | null
  const useFeeRouter = !!feeRouterAddress

  const { quote, isLoading: quoteLoading, error: quoteError, updatedAt, refresh } = useSwapQuote(
    fromToken,
    toToken,
    amountIn,
    slippageBps,
  )

  const needsPoolFee =
    quote?.routeType === 'sidra-buy' ||
    quote?.routeType === 'sidra-sell' ||
    quote?.routeType === 'wrap' ||
    quote?.routeType === 'unwrap'

  const routerBuy = useFeeRouter && quote?.routeType === 'sidra-buy'
  const routerSell = useFeeRouter && quote?.routeType === 'sidra-sell'
  const routerOneTx = routerBuy || routerSell
  const swapSpender = (routerOneTx ? feeRouterAddress : swapAddress) as Address

  const { data: nativeBalance } = useBalance({ address })
  const { balances, balancesWei, getMaxSwapAmount, isLoading: balancesLoading } =
    useTokenBalances(address, config.tokens)
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

  const fromTokenBalanceWei =
    fromToken === 'SDA' ? balancesWei.SDA : balancesWei[fromToken]
  const fromTokenBalanceReady = fromToken === 'SDA' || fromTokenBalanceWei !== undefined

  const hasEnoughBalance =
    isConnected &&
    !balancesLoading &&
    fromTokenBalanceReady &&
    nativeBalance &&
    effectiveSwapWei > 0n &&
    (fromToken === 'SDA'
      ? nativeBalance.value >= totalNeeded + GAS_RESERVE_WEI
      : (fromTokenBalanceWei ?? 0n) >= effectiveSwapWei &&
        nativeBalance.value >= swapFeeWei + GAS_RESERVE_WEI)

  const insufficientMessage =
    isConnected &&
    !balancesLoading &&
    fromTokenBalanceReady &&
    nativeBalance &&
    amountIn &&
    Number(amountIn) > 0 &&
    !hasEnoughBalance
      ? getInsufficientBalanceMessage(
          fromToken,
          amountIn,
          effectiveSwapWei,
          swapFeeWei,
          nativeBalance.value,
          fromTokenBalanceWei,
        )
      : null

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
      const minOut = minOutForExecution(activeQuote)
      const slippageParam = BigInt(activeQuote.slippageParam ?? '10000')

      if (activeQuote.routeType === 'sidra-buy') {
        if (fromToken !== 'SDA') return

        const token = toMeta?.address as Address
        if (!token) return

        if (routerBuy && feeRouterAddress) {
          const swapSda = parseEther(amountIn)
          const feeWei = platformFeeWeiFromNotionalWei(swapSda)
          writeContract({
            address: feeRouterAddress,
            abi: feeRouterAbi,
            functionName: 'sidraBuyWithFee',
            args: [token, swapSda, minOut, deadline],
            value: swapSda + feeWei,
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

        if (routerSell && feeRouterAddress) {
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
      routerBuy,
      routerSell,
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
    if (isWrongChain) {
      onSwitchNetwork?.()
      return
    }
    if (!amountIn || Number(amountIn) <= 0 || !quote || !isFeeConfigured) return
    if (!hasEnoughBalance) return
    if (needsPoolFee && swapFeeWei <= 0n) return
    if (!feeWalletAddress) return

    setPendingQuote(quote)
    setLastResult(null)
    if (routerOneTx) {
      runSwapStep(quote)
      return
    }

    setStep('fee')
    sendFee({ to: feeWalletAddress, value: swapFeeWei })
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
    const recordKey = routerOneTx ? activeSwapHash : feeTxHash
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

    notifySwapSuccess({
      fromToken,
      toToken,
      amountIn,
      amountOut: quote?.amountOut ?? '0',
      txHash: activeSwapHash ?? recordKey,
    })

    setLastResult({
      status: 'success',
      feeTxHash: routerOneTx ? undefined : feeTxHash,
      swapTxHash: activeSwapHash ?? undefined,
      feeBundledInSwap: routerOneTx,
    })
    setStep('idle')
    setAmountIn('')
    setPendingQuote(null)
  }, [
    swapSuccess,
    routerOneTx,
    feeTxHash,
    activeSwapHash,
    address,
    amountIn,
    quote,
    swapFeeWei,
    fromToken,
    toToken,
    notifySwapSuccess,
  ])

  const flipTokens = () => {
    const nextFrom = toToken
    const nextTo = fromToken
    setFromToken(nextFrom)
    setToToken(nextTo)
    setAmountIn('')
    setStep('idle')
    setPendingQuote(null)
    setLastResult(null)
    recordedRef.current = null
  }

  const handleMaxClick = () => {
    if (!canUseMax) return
    setAmountIn(maxSwapAmount)
  }

  const handleAmountFraction = (fraction: number) => {
    if (!canUseMax) return
    const max = parseFloat(maxSwapAmount)
    if (!Number.isFinite(max) || max <= 0) return
    const next = fraction >= 1 ? max : max * fraction
    setAmountIn(trimAmountInput(next.toString()))
  }

  const selectPair = (from: string, to: string) => {
    setFromToken(from)
    setToToken(to)
    setAmountIn('')
    setStep('idle')
    setPendingQuote(null)
    setLastResult(null)
    recordedRef.current = null
  }

  const outputAmount = quote?.amountOut ?? '0.00'

  function getBusyLabel(): string {
    const isBuiltInWallet = connector?.id === 'sidradx-local'
    const walletName = isBuiltInWallet ? BRAND.name : connector?.name ?? 'wallet'

    if (feePending) {
      return isBuiltInWallet ? 'Sending fee…' : `Confirm fee in ${walletName}`
    }
    if (feeConfirming) return 'Fee confirming on chain'
    if (approvePending) {
      return isBuiltInWallet ? 'Approving token…' : `Confirm approve in ${walletName}`
    }
    if (approveConfirming) return 'Approve confirming on chain'
    if (swapSendPending || swapWritePending) {
      return isBuiltInWallet ? 'Processing swap…' : `Confirm swap in ${walletName}`
    }
    if (swapConfirming) return 'Swap confirming on chain'
    if (step === 'fee') return 'Waiting for fee'
    if (step === 'approve') return 'Waiting for approve'
    if (step === 'swap') return 'Preparing swap'
    return 'Processing'
  }

  const isBusy =
    feePending ||
    feeConfirming ||
    approvePending ||
    approveConfirming ||
    swapSendPending ||
    swapWritePending ||
    swapConfirming ||
    isSwitchingNetwork ||
    step === 'fee' ||
    step === 'swap'

  const activeError = feeError ?? approveError ?? swapSendError ?? swapWriteError

  useEffect(() => {
    if (!activeError || isBusy) return
    const message =
      'shortMessage' in activeError ? activeError.shortMessage : activeError.message
    setLastResult((prev) => {
      if (prev?.status === 'success') return prev
      return {
        status: 'error',
        feeTxHash: feeTxHash ?? prev?.feeTxHash,
        swapTxHash: activeSwapHash ?? prev?.swapTxHash,
        feeBundledInSwap: routerOneTx,
        errorMessage: message,
      }
    })
  }, [activeError, isBusy, feeTxHash, activeSwapHash, routerOneTx])

  return (
    <div className={ui.root}>
      {ui.showHeader && (
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">SidraDX Swap</h4>
          <span className="text-[10px] text-cyan-500 font-bold uppercase">Live liquidity</span>
        </div>
      )}

      {appearance === 'wallet' && (
        <SwapQuickPairs
          activeFrom={fromToken}
          activeTo={toToken}
          onSelect={selectPair}
          disabled={isBusy}
        />
      )}

      {appearance === 'wallet' && (
        <div className="wallet-surface-elevated rounded-[var(--premium-radius-xl)] p-3">
          <SwapSlippagePicker
            value={settings.defaultSlippage}
            onChange={(pct) => updateSettings({ defaultSlippage: pct })}
            disabled={isBusy}
          />
        </div>
      )}

      <div className={ui.card}>
        <div className="flex items-center justify-between mb-1.5">
          <label className={ui.label}>You Pay</label>
          {isConnected && balances[fromToken] !== undefined && (
            <span className={ui.balance}>
              Balance:{' '}
              <span className={ui.balanceVal}>
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
            className={ui.input}
          />
          {canUseMax && (
            <button
              type="button"
              onClick={handleMaxClick}
              disabled={isBusy}
              className={ui.maxBtn}
            >
              Max
            </button>
          )}
          <TokenSelect
            value={fromToken}
            options={tokenOptions(config.tokens)}
            onChange={setFromToken}
            variant="pay"
            theme={ui.tokenTheme}
          />
        </div>
        {appearance === 'wallet' && (
          <SwapAmountShortcuts onPick={handleAmountFraction} disabled={isBusy || !canUseMax} />
        )}
        {fromToken === 'SDA' && canUseMax && appearance !== 'wallet' && (
          <p className="text-[10px] mt-2 text-slate-600">{SWAP_FEE_NOTICE}</p>
        )}
      </div>

      <div className="flex justify-center -my-2 relative z-10">
        <motion.button
          type="button"
          onClick={flipTokens}
          whileTap={{ scale: 0.92, rotate: 180 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          className={ui.flipBtn}
          aria-label="Flip tokens"
        >
          ⇅
        </motion.button>
      </div>

      <div className={ui.card}>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label className={ui.label}>You Receive</label>
          {updatedAt && amountIn && Number(amountIn) > 0 && (
            <button
              type="button"
              onClick={() => refresh()}
              disabled={quoteLoading || isBusy}
              className="text-[10px] font-semibold text-[#A67C00] disabled:opacity-40"
            >
              {quoteLoading ? 'Refreshing…' : 'Refresh quote'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={ui.output}>
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
            theme={ui.tokenTheme}
          />
        </div>
        {quote?.routeType && <p className={ui.route}>Route: {routeLabel(quote.routeType)}</p>}
        {quote && amountIn && Number(amountIn) > 0 && !quoteLoading && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={ui.ratePill}>
              1 {fromToken} ≈ {(Number(quote.amountOut) / Number(amountIn)).toFixed(6)} {toToken}
            </span>
            <span className={ui.ratePill}>
              Min: {Number(quote.minAmountOut).toFixed(4)} {toToken}
            </span>
          </div>
        )}
      </div>

      {isWrongChain && (
        <div className={ui.warn}>
          Wrong network — tap the button below to switch to Sidra Chain (ID {config.chainId}).
        </div>
      )}

      {isFeeConfigured && (
        <div className={ui.feeBox} role="note" aria-live="polite">
          <button
            type="button"
            onClick={() => setFeeDetailsOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 text-left"
          >
            <p className={ui.feeTitle}>{SWAP_FEE_NOTICE}</p>
            <span className="shrink-0 text-[10px] font-bold text-[#A67C00]">
              {feeDetailsOpen ? 'Hide' : 'Details'}
            </span>
          </button>
          {feeDetailsOpen && quote && amountIn && Number(amountIn) > 0 && swapFeeWei > 0n && (
            <div className={ui.feeDetail}>
              <p>Transaction summary</p>
              <p>Estimated swapping fee: ~{Number(formatUnits(swapFeeWei, 18)).toFixed(4)} SDA</p>
              <p>Slippage tolerance: {settings.defaultSlippage}%</p>
              {needsPoolFee && !routerOneTx && (
                <p>Platform fee is sent in a separate transaction before the swap.</p>
              )}
              {routerBuy && <p>One transaction — SDA fee and token buy together.</p>}
              {routerSell && <p>One transaction — fee deducted from your SDA/WSDA output.</p>}
            </div>
          )}
        </div>
      )}

      {!isFeeConfigured && (
        <div className={ui.warn + ' font-mono'}>
          Fee address not configured. Set SWAP_FEE_RECIPIENT in .env
        </div>
      )}

      {isFeeWalletConnected && (
        <div
          className={
            appearance === 'wallet'
              ? 'swap-alert leading-relaxed'
              : 'p-3.5 rounded-[20px] text-xs leading-relaxed bg-amber-950/50 border border-amber-700 text-amber-300'
          }
        >
          You connected the fee collection wallet. Swaps must use a different wallet, or the
          platform fee is sent back to the same address and you will not see fee income.
        </div>
      )}

      {quoteError && amountIn && <div className={ui.warn}>{quoteError}</div>}

      <button
        type="button"
        onClick={handleSwapClick}
        disabled={
          isBusy ||
          isFeeWalletConnected ||
          (isConnected &&
            !isWrongChain &&
            (!amountIn ||
              Number(amountIn) <= 0 ||
              !isFeeConfigured ||
              !quote ||
              !!quoteError ||
              !hasEnoughBalance))
        }
        className={ui.primaryBtn}
      >
        {!isConnected
          ? 'Connect Wallet'
          : isWrongChain
            ? isSwitchingNetwork
              ? 'Switching network…'
              : 'Switch to Sidra Chain'
          : !amountIn
            ? 'Enter Amount'
            : isFeeWalletConnected
              ? 'Use a different wallet to swap'
            : isBusy
              ? <LoadingLabel text={getBusyLabel()} />
              : 'Swap on SidraDX'}
      </button>

      {insufficientMessage && (
        <div className={ui.err}>
          <p>{insufficientMessage}</p>
          {quote && amountIn && swapFeeWei > 0n && (
            <p className={`mt-2 font-mono ${ui.errMuted}`}>
              Estimated fee: ~{Number(formatUnits(swapFeeWei, 18)).toFixed(4)} SDA
            </p>
          )}
          {fromToken !== 'SDA' && canUseMax && (
            <span className={`block mt-2 ${ui.errMuted}`}>
              Tip: use the Max button for your full {fromToken} balance.
            </span>
          )}
        </div>
      )}

      {(isBusy || feeTxHash || activeSwapHash || approveTxHash) && (
        <div className={ui.statusCard}>
          <p className={ui.statusLabel}>Transaction status</p>
          {feeTxHash && !routerOneTx && (
            <div>
              <TxExplorerLink hash={feeTxHash} label="Fee tx" />
              {(feePending || feeConfirming) && (
                <p className={ui.statusHint}>Fee confirming…</p>
              )}
            </div>
          )}
          {approveTxHash && (
            <div>
              <TxExplorerLink hash={approveTxHash} label="Approve tx" />
              {(approvePending || approveConfirming) && (
                <p className={ui.statusHint}>Approve confirming…</p>
              )}
            </div>
          )}
          {activeSwapHash && (
            <div>
              <TxExplorerLink
                hash={activeSwapHash}
                label={routerOneTx ? 'Swap + fee tx' : 'Swap tx'}
              />
              {(swapSendPending || swapWritePending || swapConfirming) && (
                <p className={ui.statusHint}>Swap confirming…</p>
              )}
            </div>
          )}
        </div>
      )}

      {lastResult?.status === 'success' && (
        <div className={ui.successCard}>
          <p className={ui.successTitle}>Swap complete on Sidra Chain</p>
          {lastResult.feeBundledInSwap && lastResult.swapTxHash && (
            <TxExplorerLink hash={lastResult.swapTxHash} label="Swap + fee tx" />
          )}
          {!lastResult.feeBundledInSwap && lastResult.feeTxHash && (
            <TxExplorerLink hash={lastResult.feeTxHash} label="Fee tx" />
          )}
          {!lastResult.feeBundledInSwap && lastResult.swapTxHash && (
            <TxExplorerLink hash={lastResult.swapTxHash} label="Swap tx" />
          )}
        </div>
      )}

      {lastResult?.status === 'error' && (
        <div className={ui.errorCard}>
          {lastResult.errorMessage && <p>{lastResult.errorMessage}</p>}
          {lastResult.feeTxHash && !lastResult.feeBundledInSwap && (
            <>
              <TxExplorerLink hash={lastResult.feeTxHash} label="Fee tx (sent)" />
              <p className={`text-[11px] leading-relaxed ${ui.errMuted}`}>
                Fee was already deducted. If the swap failed, try again with a slightly smaller
                amount or wait for a fresh quote. Check the fee tx on SidraScan above.
              </p>
            </>
          )}
          {lastResult.swapTxHash && (
            <TxExplorerLink hash={lastResult.swapTxHash} label="Failed swap tx" />
          )}
        </div>
      )}

      {activeError && !lastResult && (
        <div className={`${ui.errorCard} ${ui.errorMono} space-y-2`}>
          <p>
            {'shortMessage' in activeError
              ? activeError.shortMessage
              : activeError.message}
          </p>
          {feeTxHash && !routerOneTx && (
            <>
              <TxExplorerLink hash={feeTxHash} label="Fee tx (sent)" />
              <p className={`text-[11px] leading-relaxed ${ui.errMuted}`}>
                Platform fee was already sent. If the swap failed, try again with a slightly
                smaller amount or wait a moment for a fresh quote.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
