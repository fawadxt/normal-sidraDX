import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

export type SettingsIconTone =
  | 'gold'
  | 'green'
  | 'blue'
  | 'purple'
  | 'red'
  | 'orange'
  | 'teal'
  | 'slate'

const toneStyles: Record<SettingsIconTone, string> = {
  gold: 'settings-icon-tile settings-icon-tile--gold',
  green: 'settings-icon-tile settings-icon-tile--green',
  blue: 'settings-icon-tile settings-icon-tile--blue',
  purple: 'settings-icon-tile settings-icon-tile--purple',
  red: 'settings-icon-tile settings-icon-tile--red',
  orange: 'settings-icon-tile settings-icon-tile--orange',
  teal: 'settings-icon-tile settings-icon-tile--teal',
  slate: 'settings-icon-tile settings-icon-tile--slate',
}

type IconTileProps = {
  tone?: SettingsIconTone
  children: ReactNode
}

export function SettingsIconTile({ tone = 'gold', children }: IconTileProps) {
  return (
    <span className={`settings-icon-tile ${toneStyles[tone]}`}>
      {children}
    </span>
  )
}

type Props = {
  right?: ReactNode
}

export function SettingsHeader({ right }: Props) {
  return (
    <header className="settings-header sticky top-0 z-30 flex items-center justify-end px-5 py-3 backdrop-blur-xl">
      {right}
    </header>
  )
}

type SectionProps = {
  title: string
  children: ReactNode
}

export function SettingsSection({ title, children }: SectionProps) {
  return (
    <section className="mt-5">
      <h2 className="mb-1.5 px-1 text-[14px] font-medium text-[#A67C00]">{title}</h2>
      <div className="settings-surface overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {children}
      </div>
    </section>
  )
}

type RowProps = {
  label: string
  hint?: string
  value?: string
  onClick?: () => void
  trailing?: ReactNode
  disabled?: boolean
  danger?: boolean
  icon?: ReactNode
}

export function SettingsRow({
  label,
  hint,
  value,
  onClick,
  trailing,
  disabled,
  danger,
  icon,
}: RowProps) {
  const Tag = onClick && !disabled ? 'button' : 'div'

  return (
    <Tag
      type={onClick && !disabled ? 'button' : undefined}
      onClick={disabled ? undefined : onClick}
      className={`settings-row flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
        onClick && !disabled ? 'active:bg-[#F8F8FA]' : ''
      } ${disabled ? 'opacity-45' : ''} border-b border-[#ECECF0] last:border-b-0`}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <p className={`text-[15px] leading-[1.25] ${danger ? 'font-medium text-red-600' : 'settings-text-primary font-medium'}`}>
          {label}
        </p>
        {hint && (
          <p className="settings-text-secondary mt-[2px] line-clamp-2 text-[13px] leading-[1.35]">{hint}</p>
        )}
      </div>
      {value && (
        <span className="settings-text-secondary shrink-0 text-[14px] font-normal">{value}</span>
      )}
      {trailing}
      {onClick && !trailing && !disabled && !value && (
        <span className="shrink-0 text-[18px] font-light text-[#C7C7CC]" aria-hidden>
          ›
        </span>
      )}
    </Tag>
  )
}

type ToggleProps = {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  icon?: ReactNode
}

export function SettingsToggle({ label, hint, checked, onChange, disabled, icon }: ToggleProps) {
  return (
    <SettingsRow
      label={label}
      hint={hint}
      disabled={disabled}
      icon={icon}
      trailing={
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors ${
            checked ? 'bg-[#D4AF37]' : 'bg-[#E5E5EA]'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 520, damping: 34 }}
            className={`absolute top-[2px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.14)] ${
              checked ? 'left-[20px]' : 'left-[2px]'
            }`}
          />
        </button>
      }
    />
  )
}

type ToastProps = {
  message: string
  visible: boolean
}

export function SettingsToast({ message, visible }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-[20px] border border-[#D4AF37]/30 bg-white/95 px-4 py-3 text-center text-sm font-medium text-[#111111] shadow-[0_12px_40px_rgba(212,175,55,0.2)] backdrop-blur-md"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function DotsMenuIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  )
}

export function MenuIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  )
}

export function GridMenuIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  )
}
