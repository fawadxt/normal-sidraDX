import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { generateMnemonic, english } from 'viem/accounts'
import {
  normalizeMnemonic,
  normalizePrivateKey,
  saveWalletSecret,
} from '../lib/walletStorage'
import { setActiveLocalAccount } from '../config/localWalletConnector'
import { BRAND } from '../config/brand'
import { RecoveryPhraseGrid } from './wallet/RecoveryPhraseGrid'
import { RecoveryPhraseInput } from './wallet/RecoveryPhraseInput'
import { WarningIcon } from './wallet/WalletIcons'
import type { Account } from 'viem'

type Mode = 'import' | 'create'

type Props = {
  mode: Mode
  onBack: () => void
  onReady: () => void
}

type ImportMethod = 'phrase' | 'key'

export function ImportWalletFlow({ mode, onBack, onReady }: Props) {
  const [secret, setSecret] = useState('')
  const [importMethod, setImportMethod] = useState<ImportMethod>('phrase')
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string | null>(null)
  const [confirmedBackup, setConfirmedBackup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (mode !== 'create') return
    setGeneratedMnemonic(generateMnemonic(english))
  }, [mode])

  const connectLocal = async () => {
    const { accountFromStoredSecret } = await import('../lib/walletStorage')
    const account = await accountFromStoredSecret()
    if (!account) throw new Error('Wallet not saved')
    setActiveLocalAccount(account as Account)
    onReady()
  }

  const handleImport = async () => {
    setError(null)
    setBusy(true)
    try {
      const pk = normalizePrivateKey(secret)
      if (pk) {
        saveWalletSecret({ type: 'privateKey', value: pk })
        await connectLocal()
        return
      }

      const mnemonic = normalizeMnemonic(secret)
      if (mnemonic) {
        saveWalletSecret({ type: 'mnemonic', value: mnemonic })
        await connectLocal()
        return
      }

      setError('Enter a valid private key (64 hex chars) or complete 12-word recovery phrase.')
    } catch {
      setError('Could not import wallet. Check your input.')
    } finally {
      setBusy(false)
    }
  }

  const handleCreateContinue = async () => {
    if (!generatedMnemonic || !confirmedBackup) return
    setBusy(true)
    setError(null)
    try {
      saveWalletSecret({ type: 'mnemonic', value: generatedMnemonic })
      await connectLocal()
    } catch {
      setError('Could not create wallet.')
    } finally {
      setBusy(false)
    }
  }

  if (mode === 'create') {
    return (
      <div className="space-y-5 p-5">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-[#A67C00] cursor-pointer"
        >
          ← Back
        </button>

        <div>
          <h3 className="text-lg font-semibold text-[#111111]">Your new {BRAND.name}</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#777777]">
            Write down these 12 words in order. This is the only way to recover your wallet.
          </p>
        </div>

        <div className="flex items-start gap-2.5 rounded-[16px] border border-amber-200/80 bg-[#FFF8E8] p-3.5">
          <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#A67C00]" />
          <p className="text-[11px] font-medium leading-relaxed text-[#7A5A00]">
            Never screenshot or share your phrase. Store it offline in a safe place.
          </p>
        </div>

        {generatedMnemonic && (
          <RecoveryPhraseGrid phrase={generatedMnemonic} defaultHidden />
        )}

        <label className="flex cursor-pointer items-start gap-3 rounded-[16px] border border-black/[0.06] bg-[#FAFAFA] p-4">
          <input
            type="checkbox"
            checked={confirmedBackup}
            onChange={(e) => setConfirmedBackup(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[#D4AF37]/40 accent-[#D4AF37]"
          />
          <span className="text-xs leading-relaxed text-[#555555]">
            I have saved my recovery phrase securely and understand it cannot be recovered if
            lost.
          </span>
        </label>

        {error && (
          <div className="rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <motion.button
          type="button"
          disabled={!confirmedBackup || busy || !generatedMnemonic}
          onClick={handleCreateContinue}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-[16px] py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(212,175,55,0.28)] transition-opacity disabled:opacity-45"
          style={{ background: 'linear-gradient(135deg, #F7D878, #D4AF37, #A67C00)' }}
        >
          {busy ? 'Creating wallet…' : 'Create wallet'}
        </motion.button>
      </div>
    )
  }

  return (
    <div className="space-y-5 p-5">
      <button
        type="button"
        onClick={onBack}
        className="text-xs font-semibold text-[#A67C00] cursor-pointer"
      >
        ← Back
      </button>

      <div>
        <h3 className="text-lg font-semibold text-[#111111]">Import wallet</h3>
        <p className="mt-1 text-xs text-[#777777]">Restore with your 12-word phrase or private key</p>
      </div>

      <div className="flex gap-2 rounded-[14px] border border-black/[0.06] bg-[#FAFAFA] p-1">
        {(
          [
            { id: 'phrase' as const, label: '12-word phrase' },
            { id: 'key' as const, label: 'Private key' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setImportMethod(tab.id)
              setSecret('')
              setError(null)
            }}
            className={`tap-target flex-1 rounded-[12px] py-2.5 text-xs font-semibold transition-all ${
              importMethod === tab.id
                ? 'bg-white text-[#A67C00] shadow-sm'
                : 'text-[#777777]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {importMethod === 'phrase' ? (
        <RecoveryPhraseInput value={secret} onChange={setSecret} disabled={busy} />
      ) : (
        <textarea
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="0x followed by 64 hex characters"
          rows={4}
          className="w-full resize-none rounded-[16px] border border-black/[0.06] bg-[#FAFAFA] p-4 font-mono text-xs text-[#111111] outline-none focus:border-[#D4AF37]/50"
        />
      )}

      {error && (
        <div className="rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      <motion.button
        type="button"
        disabled={busy || !secret.trim()}
        onClick={handleImport}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-[16px] py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(212,175,55,0.28)] transition-opacity disabled:opacity-45"
        style={{ background: 'linear-gradient(135deg, #F7D878, #D4AF37, #A67C00)' }}
      >
        {busy ? 'Importing…' : 'Import wallet'}
      </motion.button>
    </div>
  )
}
