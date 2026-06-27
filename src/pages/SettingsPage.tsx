import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useDisconnect } from 'wagmi'
import { useAppConfig } from '../hooks/useAppConfig'
import { usePortfolio, truncateAddress } from '../hooks/usePortfolio'
import { useWalletProfile } from '../hooks/useWalletProfile'
import { useWalletSettings } from '../hooks/useWalletSettings'
import { useWalletShell } from '../context/WalletShellContext'
import { useWalletLock } from '../context/WalletLockContext'
import { clearStoredPrivateKey, hasStoredWallet } from '../lib/walletStorage'
import {
  SettingsHeader,
  SettingsRow,
  SettingsSection,
  SettingsToggle,
  SettingsToast,
  MenuIcon,
  GridMenuIcon,
} from '../components/settings/SettingsUI'
import { settingsIcon } from '../components/settings/SettingsIcons'
import { BRAND } from '../config/brand'
import {
  ConfirmRemoveDialog,
  ProfileDetailSheet,
  RenameWalletModal,
  SettingsProfileCard,
  SettingsQuickMenu,
  WalletActionMenu,
} from '../components/settings/SettingsModals'

const APP_VERSION = BRAND.version
const BUILD = import.meta.env.MODE === 'production' ? 'production' : 'dev'

export function SettingsPage() {
  const navigate = useNavigate()
  const { config } = useAppConfig()
  const { address, isConnected, balanceHidden, openConnect } = useWalletShell()
  const { totalUsd } = usePortfolio(address, config.tokens, config.exchangeRate)
  const { settings, updateSettings, resetSettings } = useWalletSettings()
  const { lockNow } = useWalletLock()
  const { displayName, profileCount, rename, remove } = useWalletProfile(address)
  const { disconnect } = useDisconnect()

  const [menuOpen, setMenuOpen] = useState(false)
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const balanceLabel = isConnected
    ? `$${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '$0.00'

  const shortAddress =
    isConnected && address ? truncateAddress(address, 8, 6) : 'Not connected'

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2800)
  }, [])

  const cycleTheme = () => {
    const order = ['gold', 'light', 'dark'] as const
    const idx = order.indexOf(settings.theme)
    updateSettings({ theme: order[(idx + 1) % order.length] })
  }

  const cycleLanguage = () => {
    const order = ['en', 'ur', 'ar'] as const
    const idx = order.indexOf(settings.language)
    updateSettings({ language: order[(idx + 1) % order.length] })
  }

  const languageLabel = { en: 'English', ur: 'Urdu', ar: 'Arabic' }[settings.language]
  const themeLabel = { gold: 'Gold Theme', light: 'Light', dark: 'Dark' }[settings.theme]

  const handleDisconnect = () => {
    disconnect()
    lockNow()
    showToast('Wallet locked')
  }

  const handleRemoveConfirm = () => {
    setRemoveOpen(false)
    if (hasStoredWallet()) clearStoredPrivateKey()
    remove()
    disconnect()
    showToast('Wallet removed — import again with your phrase')
    navigate('/onboarding', { replace: true })
  }

  const handleRenameSave = (name: string) => {
    rename(name)
    setRenameOpen(false)
    showToast('Wallet renamed')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-page">
      <SettingsHeader
        right={
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Quick actions"
              onClick={() => navigate('/')}
              className="wallet-icon-btn-muted"
            >
              <GridMenuIcon />
            </button>
            <button
              type="button"
              aria-label="Settings menu"
              onClick={() => setHeaderMenuOpen(true)}
              className="wallet-icon-btn-muted"
            >
              <MenuIcon />
            </button>
          </div>
        }
      />

      <SettingsProfileCard
        name={displayName}
        address={shortAddress}
        balance={balanceLabel}
        hidden={balanceHidden}
        connected={isConnected}
        onMenuOpen={() => setMenuOpen(true)}
        onProfileTap={() => isConnected && setProfileOpen(true)}
      />

      <div className="mx-5 mt-2 space-y-0">
        <SettingsSection title="Wallets">
          <SettingsRow
            label="Add Wallet"
            hint="Create or connect another wallet"
            icon={settingsIcon('userAdd', 'gold')}
            onClick={openConnect}
          />
          <SettingsRow
            label="Import Wallet"
            hint="Restore from recovery phrase"
            icon={settingsIcon('import', 'blue')}
            onClick={openConnect}
          />
          {hasStoredWallet() && (
            <SettingsRow
              label="Export Wallet"
              hint="Backup your recovery phrase securely"
              icon={settingsIcon('export', 'teal')}
              onClick={() => showToast('Open Import flow to view backup options')}
            />
          )}
          <SettingsRow
            label="Switch Wallet"
            value={`${profileCount}`}
            icon={settingsIcon('wallet', 'gold')}
            onClick={openConnect}
          />
        </SettingsSection>

        <SettingsSection title="Settings">
          <SettingsRow
            label="Appearance"
            hint={`${themeLabel}, ${settings.cardStyle === 'default' ? 'Default cards' : 'Compact cards'}`}
            icon={settingsIcon('appearance', 'blue')}
            onClick={cycleTheme}
          />
          <SettingsRow
            label="Security"
            hint="Passcode, biometric, auto-lock"
            icon={settingsIcon('shield', 'green')}
            onClick={() => navigate('/settings/security')}
          />
          <SettingsRow
            label="Assets & Activity"
            hint="Base currency, token order, hidden tokens"
            icon={settingsIcon('assets', 'blue')}
            onClick={() => navigate('/settings/assets')}
          />
          <SettingsRow
            label="Swap Settings"
            hint={`${settings.defaultSlippage}% slippage, ${settings.gasPreference} gas`}
            icon={settingsIcon('swap', 'gold')}
            onClick={() =>
              updateSettings({
                defaultSlippage: settings.defaultSlippage >= 5 ? 1 : settings.defaultSlippage + 0.5,
              })
            }
          />
          <SettingsRow
            label="Notifications & Sounds"
            hint="Alerts, push, sound"
            icon={settingsIcon('bell', 'red')}
            onClick={() => updateSettings({ pushNotifications: !settings.pushNotifications })}
          />
          <SettingsRow
            label="Language"
            hint={languageLabel ?? 'English'}
            icon={settingsIcon('globe', 'purple')}
            onClick={cycleLanguage}
          />
        </SettingsSection>

        <SettingsSection title="Assets">
          <SettingsRow
            label="Transaction History"
            hint="View all wallet activity"
            icon={settingsIcon('history', 'blue')}
            onClick={() => navigate('/history')}
          />
          <SettingsRow
            label="Base Currency"
            value={settings.baseCurrency}
            icon={settingsIcon('chart', 'teal')}
            onClick={() =>
              updateSettings({ baseCurrency: settings.baseCurrency === 'USD' ? 'SDA' : 'USD' })
            }
          />
          <SettingsToggle
            label="Hide Empty Tokens"
            hint="Hide zero-balance assets"
            checked={settings.hideEmptyTokens}
            icon={settingsIcon('assets', 'blue')}
            onChange={(v) => updateSettings({ hideEmptyTokens: v })}
          />
          <SettingsToggle
            label="Compact Mode"
            hint="Tighter layout across the wallet"
            checked={settings.compactMode}
            icon={settingsIcon('compact', 'blue')}
            onChange={(v) => updateSettings({ compactMode: v })}
          />
        </SettingsSection>

        <SettingsSection title="Swap">
          <SettingsRow
            label="Default Slippage"
            value={`${settings.defaultSlippage}%`}
            icon={settingsIcon('swap', 'gold')}
            onClick={() =>
              updateSettings({
                defaultSlippage: settings.defaultSlippage >= 5 ? 1 : settings.defaultSlippage + 0.5,
              })
            }
          />
          <SettingsRow
            label="Gas Preferences"
            value={settings.gasPreference === 'standard' ? 'Standard' : 'Fast'}
            icon={settingsIcon('gas', 'orange')}
            onClick={() =>
              updateSettings({
                gasPreference: settings.gasPreference === 'standard' ? 'fast' : 'standard',
              })
            }
          />
          <SettingsToggle
            label="Transaction Preview"
            checked={settings.txPreview}
            icon={settingsIcon('swap', 'gold')}
            onChange={(v) => updateSettings({ txPreview: v })}
          />
          <SettingsToggle
            label="Auto Route"
            checked={settings.autoRoute}
            icon={settingsIcon('swap', 'teal')}
            onChange={(v) => updateSettings({ autoRoute: v })}
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsToggle
            label="Push Notifications"
            checked={settings.pushNotifications}
            icon={settingsIcon('bell', 'red')}
            onChange={(v) => updateSettings({ pushNotifications: v })}
          />
          <SettingsToggle
            label="Transaction Alerts"
            checked={settings.txAlerts}
            icon={settingsIcon('bell', 'red')}
            onChange={(v) => updateSettings({ txAlerts: v })}
          />
          <SettingsToggle
            label="Swap Alerts"
            checked={settings.swapAlerts}
            icon={settingsIcon('bell', 'orange')}
            onChange={(v) => updateSettings({ swapAlerts: v })}
          />
          <SettingsToggle
            label="Sound"
            checked={settings.soundEnabled}
            icon={settingsIcon('bell', 'purple')}
            onChange={(v) => updateSettings({ soundEnabled: v })}
          />
        </SettingsSection>

        <SettingsSection title="Help">
          <SettingsRow
            label="Get Support"
            value="@sidra"
            icon={settingsIcon('chat', 'gold')}
            onClick={() => showToast('Support: support@sidra.wallet')}
          />
          <SettingsRow
            label="Help Center"
            icon={settingsIcon('help', 'blue')}
            onClick={() => showToast('Help center coming soon')}
          />
          <SettingsRow
            label="FAQ"
            icon={settingsIcon('help', 'purple')}
            onClick={() => showToast('FAQ coming soon')}
          />
          <SettingsRow
            label="Report Issue"
            icon={settingsIcon('chat', 'red')}
            onClick={() => showToast('Report submitted')}
          />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow
            label={`About ${BRAND.name}`}
            hint="App info"
            icon={settingsIcon('info', 'blue')}
            onClick={() => navigate('/settings/about')}
          />
          <SettingsRow
            label="Privacy Policy"
            icon={settingsIcon('document', 'slate')}
            onClick={() => navigate('/settings/privacy')}
          />
          <SettingsRow label="Terms" icon={settingsIcon('document', 'slate')} onClick={() => showToast('Terms coming soon')} />
        </SettingsSection>

        {isConnected && (
          <button
            type="button"
            onClick={handleDisconnect}
            className="wallet-cta-btn mt-6 rounded-[20px] border border-red-200 bg-white text-red-600"
          >
            Disconnect Wallet
          </button>
        )}

        <p className="settings-text-secondary pt-5 text-center text-[12px]">
          {BRAND.name} v{APP_VERSION} ({BUILD})
        </p>
      </div>

      <WalletActionMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onRename={() => setRenameOpen(true)}
        onRemove={() => setRemoveOpen(true)}
        canRemove={profileCount > 1 && isConnected}
      />

      <RenameWalletModal
        open={renameOpen}
        initialName={displayName}
        onClose={() => setRenameOpen(false)}
        onSave={handleRenameSave}
      />

      <ConfirmRemoveDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        onConfirm={handleRemoveConfirm}
      />

      <ProfileDetailSheet
        open={profileOpen}
        name={displayName}
        fullAddress={address ?? ''}
        balance={balanceLabel}
        onClose={() => setProfileOpen(false)}
      />

      <SettingsQuickMenu
        open={headerMenuOpen}
        onClose={() => setHeaderMenuOpen(false)}
        onHelp={() => showToast('Help center coming soon')}
        onReset={() => {
          resetSettings()
          showToast('Settings reset')
        }}
      />

      <SettingsToast message={toast ?? ''} visible={!!toast} />
    </motion.div>
  )
}
