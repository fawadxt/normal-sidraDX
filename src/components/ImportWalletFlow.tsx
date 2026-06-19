import { useEffect, useState } from 'react'
import { generateMnemonic, english } from 'viem/accounts'
import {
  normalizeMnemonic,
  normalizePrivateKey,
  saveWalletSecret,
} from '../lib/walletStorage'
import { setActiveLocalAccount } from '../config/localWalletConnector'
import type { Account } from 'viem'

type Mode = 'import' | 'create'

type Props = {
  mode: Mode
  onBack: () => void
  onReady: () => void
}

export function ImportWalletFlow({ mode, onBack, onReady }: Props) {
  const [secret, setSecret] = useState('')
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

      setError('Enter a valid private key (64 hex chars) or 12/24 word seed phrase.')
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
      <div className="p-4 space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
        >
          ← Back
        </button>
        <div>
          <h3 className="font-bold text-slate-900">Your new SidraDX wallet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Save this seed phrase offline. It is stored only in this browser.
          </p>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-[11px] font-mono text-amber-900 leading-relaxed break-words select-all">
            {generatedMnemonic}
          </p>
        </div>
        <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmedBackup}
            onChange={(e) => setConfirmedBackup(e.target.checked)}
            className="mt-0.5"
          />
          I saved my recovery phrase in a safe place
        </label>
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs">
            {error}
          </div>
        )}
        <button
          type="button"
          disabled={!confirmedBackup || busy}
          onClick={handleCreateContinue}
          className="w-full py-3 bg-slate-900 disabled:bg-slate-300 text-white font-bold rounded-xl cursor-pointer"
        >
          {busy ? 'Creating…' : 'Create & Connect'}
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
      >
        ← Back
      </button>
      <div>
        <h3 className="font-bold text-slate-900">Import wallet</h3>
        <p className="text-xs text-slate-500 mt-1">Private key or 12/24 word seed phrase</p>
      </div>
      <textarea
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        placeholder="0x… or word1 word2 word3 …"
        rows={4}
        className="w-full p-3 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 resize-none"
      />
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs">
          {error}
        </div>
      )}
      <button
        type="button"
        disabled={busy || !secret.trim()}
        onClick={handleImport}
        className="w-full py-3 bg-slate-900 disabled:bg-slate-300 text-white font-bold rounded-xl cursor-pointer"
      >
        {busy ? 'Importing…' : 'Import & Connect'}
      </button>
    </div>
  )
}
