import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/wallet/PageHeader'
import { SetPasscodeModal } from '../components/lock/SetPasscodeModal'
import { ShowRecoveryPhraseModal } from '../components/lock/ShowRecoveryPhraseModal'
import {
  SettingsRow,
  SettingsSection,
  SettingsToggle,
  SettingsToast,
} from '../components/settings/SettingsUI'
import { settingsIcon } from '../components/settings/SettingsIcons'
import { useWalletSettings } from '../hooks/useWalletSettings'
import { useWalletShell } from '../context/WalletShellContext'
import { useWalletLock } from '../context/WalletLockContext'
import { clearPasscode, hasPasscode, autoLockLabel } from '../lib/walletLock'
import { loadWalletSecret } from '../lib/walletStorage'
import { isBiometricAvailable } from '../lib/biometricUnlock'
import type { AutoLockTimeout } from '../lib/walletSettings'

export function SecuritySettingsPage() {
  const { settings, updateSettings } = useWalletSettings()
  const { balanceHidden, toggleBalanceHidden } = useWalletShell()
  const { lockNow } = useWalletLock()

  const [toast, setToast] = useState<string | null>(null)
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false)
  const [passcodeModalMode, setPasscodeModalMode] = useState<'create' | 'change'>('create')
  const [phraseModalOpen, setPhraseModalOpen] = useState(false)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2800)
  }, [])

  const openCreatePasscode = () => {
    setPasscodeModalMode('create')
    setPasscodeModalOpen(true)
  }

  const openShowRecoveryPhrase = () => {
    const secret = loadWalletSecret()
    if (!secret) {
      showToast('No wallet found on this device')
      return
    }
    if (secret.type !== 'mnemonic') {
      showToast('This wallet uses a private key — no recovery phrase')
      return
    }
    if (!hasPasscode()) {
      showToast('Set a passcode first')
      openCreatePasscode()
      return
    }
    setPhraseModalOpen(true)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="wallet-subpage">
      <PageHeader title="Security" backTo="/settings" />

      <div className="mx-5 mt-2 space-y-0">
        <SettingsSection title="App Lock">
          <SettingsToggle
            label="Passcode Lock"
            hint="4-digit unlock code"
            checked={settings.passcodeLock}
            icon={settingsIcon('key', 'green')}
            onChange={(v) => {
              if (v) {
                if (!hasPasscode()) {
                  openCreatePasscode()
                  return
                }
                updateSettings({ passcodeLock: true })
                lockNow()
                return
              }
              clearPasscode()
              updateSettings({ passcodeLock: false, biometricLock: false })
            }}
          />
          {hasPasscode() && (
            <SettingsRow
              label="Change Passcode"
              hint="Update your 4-digit code"
              icon={settingsIcon('key', 'green')}
              onClick={() => {
                setPasscodeModalMode('change')
                setPasscodeModalOpen(true)
              }}
            />
          )}
          <SettingsToggle
            label="Biometric Lock"
            hint="Fingerprint or face unlock"
            checked={settings.biometricLock}
            icon={settingsIcon('fingerprint', 'green')}
            onChange={async (v) => {
              if (v && !hasPasscode()) {
                showToast('Set a passcode first')
                openCreatePasscode()
                return
              }
              if (v) {
                const avail = await isBiometricAvailable()
                if (!avail) {
                  showToast('Biometric not available on this device')
                  return
                }
              }
              updateSettings({ biometricLock: v })
            }}
          />
        </SettingsSection>

        <SettingsSection title="Auto Lock">
          <SettingsToggle
            label="Auto Lock"
            hint="Lock when app is idle"
            checked={settings.autoLock}
            icon={settingsIcon('lock', 'slate')}
            onChange={(v) => updateSettings({ autoLock: v })}
          />
          <SettingsRow
            label="Auto Lock Timer"
            hint="Idle time before lock"
            value={autoLockLabel(settings.sessionTimeout)}
            icon={settingsIcon('lock', 'slate')}
            onClick={() => {
              const opts: AutoLockTimeout[] = ['30s', '1m', '5m', '15m', '30m', 'immediate']
              const i = opts.indexOf(settings.sessionTimeout)
              updateSettings({ sessionTimeout: opts[(i + 1) % opts.length] })
            }}
          />
          {settings.passcodeLock && hasPasscode() && (
            <SettingsRow
              label="Lock Now"
              hint="Lock wallet immediately"
              icon={settingsIcon('lock', 'gold')}
              onClick={() => {
                lockNow()
                showToast('Wallet locked')
              }}
            />
          )}
        </SettingsSection>

        <SettingsSection title="Privacy">
          <SettingsToggle
            label="Hide Balance"
            hint="Tap balance on home card to toggle"
            checked={balanceHidden}
            icon={settingsIcon('eye', 'slate')}
            onChange={() => toggleBalanceHidden()}
          />
        </SettingsSection>

        <SettingsSection title="Backup">
          <SettingsRow
            label="Show Recovery Phrase"
            hint="View your 12-word backup phrase"
            icon={settingsIcon('document', 'gold')}
            onClick={openShowRecoveryPhrase}
          />
          <SettingsToggle
            label="Backup Reminder"
            hint="Remind to save recovery phrase"
            checked={settings.backupReminder}
            icon={settingsIcon('export', 'teal')}
            onChange={(v) => updateSettings({ backupReminder: v })}
          />
        </SettingsSection>
      </div>

      <SettingsToast message={toast ?? ''} visible={!!toast} />

      <SetPasscodeModal
        open={passcodeModalOpen}
        mode={passcodeModalMode}
        onClose={() => setPasscodeModalOpen(false)}
        onComplete={() => {
          updateSettings({ passcodeLock: true })
          showToast('Passcode saved')
          lockNow()
        }}
      />

      <ShowRecoveryPhraseModal open={phraseModalOpen} onClose={() => setPhraseModalOpen(false)} />
    </motion.div>
  )
}
