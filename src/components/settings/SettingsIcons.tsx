import type { ReactNode, SVGProps } from 'react'
import { SettingsIconTile, type SettingsIconTone } from './SettingsUI'

type IconProps = { className?: string }

const iconClass = 'h-[19px] w-[19px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]'

function SettingsSvg({
  className = iconClass,
  children,
  ...props
}: IconProps & { children: ReactNode } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

function WalletIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <path d="M4 8.5h16a1.5 1.5 0 011.5 1.5v8a1.5 1.5 0 01-1.5 1.5H4a1.5 1.5 0 01-1.5-1.5v-8A1.5 1.5 0 014 8.5z" />
      <path d="M3 8.5V7a2 2 0 012-2h14a2 2 0 012 2v1.5" />
      <path d="M16.5 13.5h4.5" />
      <circle cx="17.25" cy="13.5" r="0.75" fill="currentColor" stroke="none" />
      <path d="M7 6.5V5.5M10 6.5V5.5" opacity="0.75" />
    </SettingsSvg>
  )
}

function UserAddIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <circle cx="9" cy="8.5" r="3.25" />
      <path d="M3.5 19.5c.4-3 2.8-5 5.5-5s5.1 2 5.5 5" />
      <path d="M17.5 8.5v5M15 11h5" />
    </SettingsSvg>
  )
}

function PaletteIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <path d="M12 3.5c-4.2 0-7.5 2.8-7.5 6.8 0 2.8 2.2 5 5 5 .9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.5-1 .3-.2.5-.6.5-1 0-.8.7-1.5 1.5-1.5H12c2.8 0 5-2.2 5-5 0-1.8-1.2-3.3-2.8-4.1" />
      <circle cx="8.5" cy="10" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="11.5" cy="7.5" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9.5" r="0.85" fill="currentColor" stroke="none" />
    </SettingsSvg>
  )
}

function KeyIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <circle cx="8.5" cy="14.5" r="3.25" />
      <path d="M11.2 14.5H21M17 14.5v2.5M19.5 14.5v2" />
      <path d="M8.5 11.25V10" opacity="0.7" />
    </SettingsSvg>
  )
}

function ShieldIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <path d="M12 3.5l7.5 3v6.2c0 4.6-3.2 7.1-7.5 8.3-4.3-1.2-7.5-3.7-7.5-8.3V6.5L12 3.5z" />
      <path d="M9.2 12.2l1.8 1.8 3.8-3.8" />
    </SettingsSvg>
  )
}

function FingerprintIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <path d="M12 4.5a5.5 5.5 0 00-5.5 5.5v1" />
      <path d="M12 3v1.5" />
      <path d="M7.5 10.5V12a4.5 4.5 0 009 0v-1.5" />
      <path d="M9 14.5a3 3 0 006 0v-1" />
      <path d="M10.5 17.5a1.5 1.5 0 003 0v-1" />
      <path d="M12 19.5v1" />
    </SettingsSvg>
  )
}

function AssetsIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <ellipse cx="12" cy="7" rx="7.5" ry="2.5" />
      <path d="M4.5 7v4.5c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5V7" />
      <path d="M4.5 11.5v4.5c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-4.5" />
    </SettingsSvg>
  )
}

function SwapIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <path d="M7 7h9.5M14.5 4.5L17 7l-2.5 2.5" />
      <path d="M17 17H7.5M9.5 19.5L7 17l2.5-2.5" />
      <circle cx="12" cy="12" r="8.25" opacity="0.35" />
    </SettingsSvg>
  )
}

function BellIcon(props: IconProps) {
  return (
    <SettingsSvg {...props} strokeWidth="1.7">
      <circle cx="12" cy="4.65" r="1.15" />
      <path d="M8.25 8.4c0-2.07 1.68-3.75 3.75-3.75s3.75 1.68 3.75 3.75c0 2.5 2.15 4.65 2.35 7.25H5.9c.2-2.6 2.35-4.75 2.35-7.25z" />
      <path d="M10.25 19.75a1.75 1.75 0 003.5 0" />
    </SettingsSvg>
  )
}

function GlobeIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M3.75 12h16.5" />
      <path d="M12 3.75c2.2 2.6 3.4 5.4 3.4 8.25S14.2 17.65 12 20.25" />
      <path d="M12 3.75c-2.2 2.6-3.4 5.4-3.4 8.25S9.8 17.65 12 20.25" />
    </SettingsSvg>
  )
}

function ChatIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <path d="M5 5.5h14a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5H10l-3.5 3v-3H5a1.5 1.5 0 01-1.5-1.5V7a1.5 1.5 0 011.5-1.5z" />
      <path d="M8.5 10h7M8.5 12.5h4.5" opacity="0.85" />
    </SettingsSvg>
  )
}

function HelpIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M9.5 9.2a2.75 2.75 0 015.1 1.4c0 1.8-2.6 2.1-2.6 3.9" />
      <circle cx="12" cy="17" r="0.85" fill="currentColor" stroke="none" />
    </SettingsSvg>
  )
}

function InfoIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <circle cx="12" cy="8.25" r="0.85" fill="currentColor" stroke="none" />
      <path d="M12 11v5.5" />
    </SettingsSvg>
  )
}

function DocumentIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <path d="M8 4.5h6.8L18 7.7V19a1.5 1.5 0 01-1.5 1.5H8A1.5 1.5 0 016.5 19V6A1.5 1.5 0 018 4.5z" />
      <path d="M14 4.5V8H18" />
      <path d="M9 12h6M9 15h4" opacity="0.85" />
    </SettingsSvg>
  )
}

function HistoryIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 8v4.2l2.8 1.8" />
      <path d="M8.5 5.2L7 3.7" opacity="0.8" />
    </SettingsSvg>
  )
}

function ImportIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <path d="M12 4v9.5M8.5 10.5L12 14l3.5-3.5" />
      <path d="M5 19.5h14" />
      <path d="M8 16.5h8a1.5 1.5 0 001.5-1.5V13" opacity="0.75" />
    </SettingsSvg>
  )
}

function ExportIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <path d="M12 19.5V9.5M8.5 13.5L12 10l3.5 3.5" />
      <path d="M5 4.5h14" />
      <path d="M8 7.5h8a1.5 1.5 0 011.5 1.5V11" opacity="0.75" />
    </SettingsSvg>
  )
}

function LockIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <rect x="6" y="11" width="12" height="8.5" rx="2" />
      <path d="M9 11V8.5a3 3 0 116 0V11" />
      <circle cx="12" cy="15.2" r="1.1" fill="currentColor" stroke="none" />
      <path d="M12 16.3v1.4" />
    </SettingsSvg>
  )
}

function ChartIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <path d="M4.5 19.5V6M4.5 19.5h15" />
      <path d="M8.5 15.5V11M12 15.5V8.5M15.5 15.5v-3" />
      <path d="M8.5 11l3.5-2.5 3.5 2" opacity="0.55" />
    </SettingsSvg>
  )
}

function EyeIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <path d="M3.5 12s2.8-5.5 8.5-5.5 8.5 5.5 8.5 5.5-2.8 5.5-8.5 5.5S3.5 12 3.5 12z" />
      <circle cx="12" cy="12" r="2.35" />
    </SettingsSvg>
  )
}

function GasIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <path d="M8 20.5h8l-1-8.5H9l-1 8.5z" />
      <path d="M10 6.5h4l.8 5H9.2l.8-5z" />
      <path d="M12 3.5v3" />
      <path d="M9.5 5.5h5" opacity="0.75" />
    </SettingsSvg>
  )
}

function CompactIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <path d="M5.5 6.75h6.5a1 1 0 011 1v3.5a1 1 0 01-1 1H5.5a1 1 0 01-1-1V7.75a1 1 0 011-1z" />
      <path d="M14.5 6.75H18a1 1 0 011 1v3.5a1 1 0 01-1 1h-3.5a1 1 0 01-1-1V7.75a1 1 0 011-1z" />
      <path d="M5.5 13.25h13a1 1 0 011 1v2.25a1 1 0 01-1 1h-13a1 1 0 01-1-1v-2.25a1 1 0 011-1z" />
      <path d="M5.5 18.25h13" opacity="0.72" />
    </SettingsSvg>
  )
}

function AppearanceIcon(props: IconProps) {
  return (
    <SettingsSvg {...props}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 4v1.6M12 18.4V20M5.5 5.5l1.1 1.1M17.4 17.4l1.1 1.1M4 12h1.6M18.4 12H20M5.5 18.5l1.1-1.1M17.4 6.6l1.1-1.1" opacity="0.8" />
      <path d="M16.2 8.4a4.4 4.4 0 01-6.1 5.9A4.4 4.4 0 0116.2 8.4z" opacity="0.55" />
    </SettingsSvg>
  )
}

const icons = {
  wallet: WalletIcon,
  userAdd: UserAddIcon,
  palette: PaletteIcon,
  key: KeyIcon,
  shield: ShieldIcon,
  fingerprint: FingerprintIcon,
  assets: AssetsIcon,
  swap: SwapIcon,
  bell: BellIcon,
  globe: GlobeIcon,
  chat: ChatIcon,
  help: HelpIcon,
  info: InfoIcon,
  document: DocumentIcon,
  history: HistoryIcon,
  import: ImportIcon,
  export: ExportIcon,
  lock: LockIcon,
  chart: ChartIcon,
  eye: EyeIcon,
  gas: GasIcon,
  compact: CompactIcon,
  appearance: AppearanceIcon,
} as const

export type SettingsIconName = keyof typeof icons

export function SettingsCategoryIcon({
  name,
  tone = 'gold',
}: {
  name: SettingsIconName
  tone?: SettingsIconTone
}) {
  const Icon = icons[name]
  return (
    <SettingsIconTile tone={tone}>
      <Icon />
    </SettingsIconTile>
  )
}

export function settingsIcon(name: SettingsIconName, tone?: SettingsIconTone): ReactNode {
  return <SettingsCategoryIcon name={name} tone={tone} />
}
