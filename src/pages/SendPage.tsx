import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { formatUnits, parseEther, parseUnits, type Address } from 'viem'
import { SendHeader } from '../components/wallet/SendHeader'
import { SendSuccessPanel } from '../components/wallet/SendSuccessPanel'
import { TokenSelect } from '../components/TokenSelect'
import { WalletToast } from '../components/wallet/WalletToast'
import { QrScanIcon } from '../components/wallet/WalletIcons'
import { useAppConfig } from '../hooks/useAppConfig'
import { trimAmountInput, useTokenBalances } from '../hooks/useTokenBalances'
import { useWalletShell } from '../context/WalletShellContext'
import { useActiveChain } from '../context/ActiveChainContext'
import { useQrScanner } from '../context/QrScannerContext'
import { useWalletNotifications } from '../context/WalletNotificationsContext'
import { parseScannedAddress } from '../lib/parseScannedQr'
import { erc20Abi } from '../config/abis'
import { getNativeSymbol, getTokensForChain } from '../lib/chainTokens'
import { bscChain } from '../config/bscChain'
import { sidraChain } from '../config/sidraChain'
import { NetworkSelector } from '../components/wallet/NetworkSelector'
import { sendTokenLabel } from '../lib/sendTokenLabel'
import { truncateRecipient, validateRecipient } from '../lib/validateRecipient'

type Step = 'form' | 'review' | 'success'

const GAS_RESERVE = parseEther('0.001')
const BSC_GAS_RESERVE = parseEther('0.0003')

function maxSendAmount(
  symbol: string,
  balancesWei: Record<string, bigint>,
  decimals = 18,
  chainId: number = sidraChain.id,
): string {
  const wei = balancesWei[symbol] ?? 0n
  if (wei === 0n) return '0'
  if (symbol === 'SDA' && chainId === sidraChain.id) {
    const sendable = wei > GAS_RESERVE ? wei - GAS_RESERVE : 0n
    return trimAmountInput(formatUnits(sendable, 18))
  }
  if (symbol === 'BNB' && chainId === bscChain.id) {
    const sendable = wei > BSC_GAS_RESERVE ? wei - BSC_GAS_RESERVE : 0n
    return trimAmountInput(formatUnits(sendable, 18))
  }
  return trimAmountInput(formatUnits(wei, decimals))
}

export function SendPage() {
  const location = useLocation()
  const { openScanner } = useQrScanner()
  const { notifySendSuccess } = useWalletNotifications()
  const { config } = useAppConfig()
  const { address, isConnected } = useWalletShell()
  const { activeChainId, activeChainName, switchToChain } = useActiveChain()
  const chainTokens = useMemo(
    () => getTokensForChain(activeChainId, config.tokens),
    [activeChainId, config.tokens],
  )
  const { balances, balancesWei, isLoading: balancesLoading } = useTokenBalances(
    address,
    chainTokens,
    activeChainId,
  )

  const [recipient, setRecipient] = useState('')
  const [recipientTouched, setRecipientTouched] = useState(false)
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState(() => getNativeSymbol(activeChainId))
  const [memo, setMemo] = useState('')
  const [memoOpen, setMemoOpen] = useState(false)
  const [step, setStep] = useState<Step>('form')
  const [toast, setToast] = useState<string | null>(null)
  const [hashCopied, setHashCopied] = useState(false)
  const sendNotifiedRef = useRef<string | null>(null)

  const validation = useMemo(() => validateRecipient(recipient), [recipient])
  const recipientValid = validation.ok
  const tokenLabel = sendTokenLabel(token)
  const tokenMeta = chainTokens.find((t) => t.symbol === token)
  const isNative = !!tokenMeta?.isNative
  const decimals = tokenMeta?.decimals ?? 18

  const balanceStr = balances[token] ?? '0'
  const balanceNum = parseFloat(balanceStr === '…' ? '0' : balanceStr)
  const amountNum = parseFloat(amount)
  const amountValid = Number.isFinite(amountNum) && amountNum > 0 && amountNum <= balanceNum

  const priceUsd =
    token === 'SDA' || token === 'WSDA'
      ? config.exchangeRate
      : token === 'USDT' || token === 'USDC'
        ? 1
        : 0
  const estimatedUsd = amountValid ? amountNum * priceUsd : 0

  const maxAmount = maxSendAmount(token, balancesWei, decimals, activeChainId)

  useEffect(() => {
    setToken(getNativeSymbol(activeChainId))
    setAmount('')
  }, [activeChainId])

  const {
    data: nativeTxHash,
    sendTransaction,
    isPending: nativePending,
    error: nativeError,
  } = useSendTransaction()

  const {
    data: erc20TxHash,
    writeContract,
    isPending: erc20Pending,
    error: erc20Error,
  } = useWriteContract()

  const txHash = nativeTxHash ?? erc20TxHash
  const isPending = nativePending || erc20Pending

  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2600)
  }, [])

  useEffect(() => {
    const state = location.state as { recipient?: string } | null
    if (!state?.recipient) return
    setRecipient(state.recipient)
    setRecipientTouched(true)
  }, [location.key, location.state])

  const pasteAddress = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setRecipient(text.trim())
        setRecipientTouched(true)
      }
    } catch {
      showToast('Could not paste from clipboard')
    }
  }, [showToast])

  const scanQr = useCallback(() => {
    openScanner((text) => {
      const parsed = parseScannedAddress(text)
      if (!parsed.ok) {
        showToast(parsed.error)
        return
      }
      setRecipient(parsed.normalized)
      setRecipientTouched(true)
      showToast('Address scanned')
    })
  }, [openScanner, showToast])

  const applyMax = useCallback(() => {
    setAmount(maxAmount)
  }, [maxAmount])

  const executeSend = useCallback(async () => {
    if (!validation.ok) return

    try {
      await switchToChain(activeChainId)
    } catch {
      showToast('Could not switch network')
      return
    }

    if (isNative) {
      sendTransaction({ to: validation.normalized, value: parseEther(amount), chainId: activeChainId })
      return
    }

    if (!tokenMeta?.address) return
    writeContract({
      address: tokenMeta.address as Address,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [validation.normalized, parseUnits(amount, decimals)],
      chainId: activeChainId,
    })
  }, [
    activeChainId,
    amount,
    decimals,
    isNative,
    sendTransaction,
    showToast,
    switchToChain,
    tokenMeta?.address,
    validation,
    writeContract,
  ])

  const handlePrimary = () => {
    if (!isConnected) return
    if (!recipientValid) return

    if (step === 'form') {
      if (!amountValid) return
      setStep('review')
      return
    }

    if (step === 'review') {
      void executeSend()
    }
  }

  const copyHash = useCallback(async () => {
    if (!txHash) return
    try {
      await navigator.clipboard.writeText(txHash)
      setHashCopied(true)
      showToast('Hash copied')
      window.setTimeout(() => setHashCopied(false), 1800)
    } catch {
      showToast('Could not copy hash')
    }
  }, [showToast, txHash])

  useEffect(() => {
    if (isSuccess && txHash) setStep('success')
  }, [isSuccess, txHash])

  useEffect(() => {
    if (!isSuccess || !txHash || sendNotifiedRef.current === txHash) return
    sendNotifiedRef.current = txHash
    notifySendSuccess(amount, tokenLabel, txHash)
  }, [amount, isSuccess, notifySendSuccess, tokenLabel, txHash])

  const buttonLabel = (() => {
    if (!isConnected) return 'Wallet unavailable'
    if (!recipientValid) return 'Enter Address'
    if (step === 'review') {
      if (isPending) return 'Confirm in wallet…'
      if (confirming) return 'Confirming…'
      return `Send ${tokenLabel}`
    }
    return 'Continue'
  })()

  const buttonDisabled =
    !isConnected ||
    isPending ||
    confirming ||
    !recipientValid ||
    (step === 'form' && !amountValid)

  const txError = nativeError ?? erc20Error

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-full flex-col overflow-x-hidden pb-[calc(7.5rem+env(safe-area-inset-bottom)+var(--keyboard-offset))]"
      >
        <SendHeader />

        {step === 'success' && txHash ? (
          <SendSuccessPanel
            hash={txHash}
            amount={amount}
            tokenLabel={tokenLabel}
            copied={hashCopied}
            onCopyHash={copyHash}
          />
        ) : (
          <div className="mx-5 mt-3 flex flex-col gap-4">
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[24px] bg-white p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A67C00]">
                Network
              </p>
              <NetworkSelector className="mt-3" />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
              className="rounded-[24px] bg-white p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A67C00]">
                Send To
              </p>
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="Enter wallet address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                onBlur={() => setRecipientTouched(true)}
                disabled={step === 'review'}
                className={`mt-3 w-full rounded-[16px] border bg-[#FAFAFA] px-4 py-3.5 font-mono text-sm text-[#111111] outline-none transition-colors ${
                  recipientTouched && !recipientValid && recipient.trim()
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-black/[0.06] focus:border-[#D4AF37]/50'
                }`}
              />
              {recipientTouched && !recipientValid && recipient.trim() && (
                <p className="mt-2 text-xs text-red-500">
                  {'error' in validation ? validation.error : 'Invalid address'}
                </p>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={pasteAddress}
                  disabled={step === 'review'}
                  className="tap-target flex-1 rounded-[14px] border border-[#D4AF37]/25 bg-[#FFFBF0] py-3 text-xs font-semibold text-[#A67C00] transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  Paste
                </button>
                <button
                  type="button"
                  onClick={scanQr}
                  disabled={step === 'review'}
                  className="tap-target flex flex-1 items-center justify-center gap-2 rounded-[14px] border border-[#D4AF37]/25 bg-[#FFFBF0] py-3 text-xs font-semibold text-[#A67C00] transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  <QrScanIcon />
                  QR Scan
                </button>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-[24px] bg-white p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-end gap-3">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  disabled={step === 'review'}
                  className="wallet-text-amount min-w-0 flex-1 bg-transparent font-semibold leading-none tracking-tight text-[#111111] outline-none placeholder:text-[#D4AF37]/35"
                />
                <TokenSelect
                  value={token}
                  onChange={setToken}
                  theme="wallet"
                  variant="pay"
                  options={chainTokens.map((t) => ({
                    symbol: t.symbol,
                    name: t.symbol === 'SDA' ? 'SIDRA' : t.name,
                    balance: balances[t.symbol],
                  }))}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-[#777777]">
                    Max:{' '}
                    <span className="font-medium text-[#111111]">
                      {balancesLoading ? '…' : maxAmount} {tokenLabel}
                    </span>
                  </p>
                  {estimatedUsd > 0 && (
                    <p className="mt-1 text-xs text-[#777777]">
                      ≈ ${estimatedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-[#999999]">
                    Balance: {balancesLoading ? '…' : balanceStr} {tokenLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={applyMax}
                  disabled={step === 'review' || balancesLoading}
                  className="shrink-0 rounded-full border border-[#D4AF37]/35 bg-[#FFF9E6] px-4 py-1.5 text-xs font-bold tracking-wide text-[#A67C00] transition-transform active:scale-95 disabled:opacity-50"
                >
                  MAX
                </button>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="overflow-hidden rounded-[24px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
            >
              <button
                type="button"
                onClick={() => setMemoOpen((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-[#111111]">Comment or Memo</span>
                <svg
                  className={`h-4 w-4 text-[#A67C00] transition-transform ${memoOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <AnimatePresence initial={false}>
                {memoOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden px-5"
                  >
                    <textarea
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="Add a note (optional)"
                      rows={3}
                      disabled={step === 'review'}
                      className="mb-5 w-full resize-none rounded-[16px] border border-black/[0.06] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#D4AF37]/50"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            <AnimatePresence>
              {step === 'review' && validation.ok && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-[24px] border border-[#D4AF37]/25 bg-[#FFFBF0] p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#111111]">Review</p>
                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      className="text-xs font-semibold text-[#A67C00]"
                    >
                      Edit
                    </button>
                  </div>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#777777]">Recipient</dt>
                      <dd className="font-mono text-right text-[#111111]">
                        {truncateRecipient(validation.normalized)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#777777]">Amount</dt>
                      <dd className="font-semibold text-[#111111]">
                        {amount} {tokenLabel}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#777777]">Network</dt>
                      <dd className="text-[#111111]">{activeChainName}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#777777]">Fee</dt>
                      <dd className="text-[#111111]">Paid at confirmation</dd>
                    </div>
                    <div className="border-t border-[#D4AF37]/20 pt-3 flex justify-between gap-4">
                      <dt className="font-semibold text-[#111111]">Total</dt>
                      <dd className="font-semibold text-[#A67C00]">
                        {amount} {tokenLabel}
                      </dd>
                    </div>
                  </dl>
                </motion.section>
              )}
            </AnimatePresence>

            {txError && (
              <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {'shortMessage' in txError ? String(txError.shortMessage) : txError.message}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {step !== 'success' && (
        <div className="safe-fixed-cta pointer-events-none">
          <motion.button
            type="button"
            onClick={handlePrimary}
            disabled={buttonDisabled}
            whileTap={buttonDisabled ? undefined : { scale: 0.98 }}
            className="pointer-events-auto w-full rounded-[16px] py-2.5 text-[13px] font-semibold text-white shadow-[0_6px_20px_rgba(212,175,55,0.28)] transition-opacity disabled:opacity-45"
            style={{ background: 'linear-gradient(135deg, #F7D878, #D4AF37, #A67C00)' }}
          >
            {buttonLabel}
          </motion.button>
        </div>
      )}

      <WalletToast message={toast ?? ''} visible={!!toast} />
    </>
  )
}
