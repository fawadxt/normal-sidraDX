import { motion, AnimatePresence } from 'framer-motion'
import { DotsMenuIcon } from './SettingsUI'

type Props = {
  open: boolean
  onClose: () => void
  onRename: () => void
  onRemove: () => void
  canRemove: boolean
}

export function WalletActionMenu({ open, onClose, onRename, onRemove, canRemove }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="popover-panel fixed right-5 top-[7.5rem] z-[55] w-52 overflow-hidden rounded-[20px] border border-[#D4AF37]/25 bg-white/95 shadow-[0_16px_48px_rgba(212,175,55,0.22)] backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => {
                onClose()
                onRename()
              }}
              className="tap-target flex w-full items-center gap-2 px-4 py-3.5 text-left text-sm font-medium text-[#111111] active:bg-[#FFF9E6]"
            >
              Rename Wallet
            </button>
            <div className="h-px bg-black/[0.05]" />
            <button
              type="button"
              disabled={!canRemove}
              onClick={() => {
                if (!canRemove) return
                onClose()
                onRemove()
              }}
              className={`tap-target flex w-full items-center gap-2 px-4 py-3.5 text-left text-sm font-medium active:bg-red-50 ${
                canRemove ? 'text-red-600' : 'cursor-not-allowed text-[#999]'
              }`}
            >
              Remove Wallet
            </button>
            {!canRemove && (
              <p className="px-4 pb-3 text-[10px] text-[#777777]">Only wallet on this device</p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

type ProfileProps = {
  name: string
  address: string
  balance: string
  hidden: boolean
  connected: boolean
  onMenuOpen: () => void
  onProfileTap: () => void
}

export function SettingsProfileCard({
  name,
  address,
  balance,
  hidden,
  connected,
  onMenuOpen,
  onProfileTap,
}: ProfileProps) {
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <div className="mx-5 mt-1">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onProfileTap} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <div
            className="settings-profile-avatar shadow-[0_4px_14px_rgba(212,175,55,0.28)]"
            style={{ background: 'linear-gradient(145deg, #F6D77A, #D4AF37, #A67C00)' }}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="settings-text-primary truncate text-[17px] font-semibold leading-tight">{name}</p>
            <p className="settings-text-secondary mt-0.5 flex items-center gap-1 font-mono text-[12px]">
              <span className="truncate">{address}</span>
              {connected && (
                <svg className="h-3.5 w-3.5 shrink-0 opacity-70" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              )}
            </p>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <p className="settings-text-secondary max-w-[5.5rem] truncate text-[15px] font-medium tabular-nums sm:max-w-none">
            {hidden ? '••••' : balance}
          </p>
          <button
            type="button"
            onClick={onMenuOpen}
            aria-label="Wallet options"
            className="wallet-icon-btn-muted active:bg-[#ECECF0]"
          >
            <DotsMenuIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

type RenameProps = {
  open: boolean
  initialName: string
  onClose: () => void
  onSave: (name: string) => void
}

export function RenameWalletModal({ open, initialName, onClose, onSave }: RenameProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed inset-x-4 top-[20%] z-[55] mx-auto max-w-sm rounded-[28px] border border-[#D4AF37]/25 bg-white p-5 shadow-[0_20px_60px_rgba(212,175,55,0.25)]"
          >
            <h3 className="text-lg font-semibold text-[#111111]">Rename Wallet</h3>
            <p className="mt-1 text-xs text-[#777777]">This name is only visible on this device.</p>
            <input
              id="rename-wallet-input"
              defaultValue={initialName}
              maxLength={32}
              className="mt-4 w-full rounded-[16px] border border-black/[0.08] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20"
              placeholder="Wallet name"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="tap-target flex-1 rounded-[16px] py-3 text-sm font-medium text-[#777777]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('rename-wallet-input') as HTMLInputElement | null
                  onSave(input?.value ?? initialName)
                }}
                className="wallet-cta-btn text-white"
                style={{ background: 'linear-gradient(135deg, #F6D77A, #D4AF37, #A67C00)' }}
              >
                Save
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

type RemoveProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmRemoveDialog({ open, onClose, onConfirm }: RemoveProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-x-4 top-[28%] z-[55] mx-auto max-w-sm rounded-[28px] border border-red-200/60 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
          >
            <h3 className="text-lg font-semibold text-[#111111]">Remove wallet?</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#777777]">
              Remove this wallet from this device? Your on-chain assets are not deleted — only local
              access is removed.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="wallet-cta-btn border border-black/[0.08] text-[#111111]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="wallet-cta-btn bg-red-600 text-white"
              >
                Remove
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

type ProfileDetailProps = {
  open: boolean
  name: string
  fullAddress: string
  balance: string
  onClose: () => void
}

export function ProfileDetailSheet({ open, name, fullAddress, balance, onClose }: ProfileDetailProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed inset-x-0 bottom-0 z-[55] mx-auto max-w-md rounded-t-[28px] border border-black/[0.05] bg-white px-5 pb-safe pt-5 shadow-[0_-12px_40px_rgba(0,0,0,0.1)]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#E5E5E5]" />
            <h3 className="text-lg font-semibold text-[#111111]">Profile Details</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-[#777777]">Name</dt>
                <dd className="mt-0.5 font-medium text-[#111111]">{name}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-[#777777]">Address</dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-[#111111]">{fullAddress}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-[#777777]">Balance</dt>
                <dd className="mt-0.5 font-semibold text-[#111111]">{balance}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => {
                if (fullAddress) navigator.clipboard.writeText(fullAddress)
              }}
              className="tap-target mt-5 w-full rounded-[16px] py-3 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #F6D77A, #D4AF37, #A67C00)' }}
            >
              Copy Address
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

type QuickMenuProps = {
  open: boolean
  onClose: () => void
  onHelp: () => void
  onReset: () => void
}

export function SettingsQuickMenu({ open, onClose, onHelp, onReset }: QuickMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="popover-panel fixed right-5 top-16 z-[55] w-48 overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
          >
            <button
              type="button"
              onClick={() => {
                onClose()
                onHelp()
              }}
              className="tap-target w-full px-4 py-3 text-left text-sm text-[#111111] active:bg-[#FAFAFA]"
            >
              Help Center
            </button>
            <button
              type="button"
              onClick={() => {
                onClose()
                onReset()
              }}
              className="tap-target w-full border-t border-black/[0.05] px-4 py-3 text-left text-sm text-[#777777] active:bg-[#FAFAFA]"
            >
              Reset Settings
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
