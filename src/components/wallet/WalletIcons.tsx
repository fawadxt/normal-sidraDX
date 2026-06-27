type IconProps = { className?: string; stroke?: string }

export function NotificationBellIcon({ className = 'w-5 h-5', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <circle cx="12" cy="4.65" r="1.15" />
      <path d="M8.25 8.4c0-2.07 1.68-3.75 3.75-3.75s3.75 1.68 3.75 3.75c0 2.5 2.15 4.65 2.35 7.25H5.9c.2-2.6 2.35-4.75 2.35-7.25z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.25 19.75a1.75 1.75 0 003.5 0" strokeLinecap="round" />
    </svg>
  )
}

export function QrScanIcon({ className = 'w-5 h-5', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <path d="M4 7V4h3M20 7V4h-3M4 17v3h3M20 17v3h-3" strokeLinecap="round" />
      <rect x="7" y="7" width="4" height="4" rx="0.5" fill={stroke} stroke="none" />
      <rect x="13" y="7" width="4" height="4" rx="0.5" fill={stroke} stroke="none" />
      <rect x="7" y="13" width="4" height="4" rx="0.5" fill={stroke} stroke="none" />
      <path d="M13 13h4v4h-4z" strokeLinecap="round" />
    </svg>
  )
}

export function LockIcon({ className = 'w-5 h-5', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" strokeLinecap="round" />
    </svg>
  )
}

export function EyeIcon({ className = 'w-5 h-5', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function EyeOffIcon({ className = 'w-5 h-5', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <path d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A10.94 10.94 0 0112 5c6.5 0 10 7 10 7a18.45 18.45 0 01-4.06 5.06M6.11 6.11A18.45 18.45 0 002 12s3.5 7 10 7a10.94 10.94 0 004.91-1.17" strokeLinecap="round" />
    </svg>
  )
}

export function FundIcon({ className = 'w-6 h-6', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

export function SendIcon({ className = 'w-6 h-6', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SwapIcon({ className = 'w-6 h-6', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function EarnIcon({ className = 'w-6 h-6', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
    </svg>
  )
}

export function WalletNavIcon({ className = 'w-6 h-6', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <path d="M3 7h18v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      <path d="M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2M17 13h4" strokeLinecap="round" />
    </svg>
  )
}

export function ExploreNavIcon({ className = 'w-6 h-6', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <circle cx="12" cy="12" r="9" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round" />
    </svg>
  )
}

export function SettingsNavIcon({ className = 'w-6 h-6', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
    </svg>
  )
}

export function ChevronLeftIcon({ className = 'w-5 h-5', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CloseIcon({ className = 'w-5 h-5', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CopyIcon({ className = 'w-5 h-5', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" />
    </svg>
  )
}

export function CheckIcon({ className = 'w-5 h-5', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ShareIcon({ className = 'w-5 h-5', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DownloadIcon({ className = 'w-5 h-5', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WarningIcon({ className = 'w-5 h-5', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FingerprintIcon({ className = 'w-5 h-5', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
      <path d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v1" strokeLinecap="round" />
      <path d="M12 11V8c0-2.2 1.8-4 4-4" strokeLinecap="round" />
      <path d="M12 11v5c0 2.5-2 4.5-4.5 4.5S3 18.5 3 16" strokeLinecap="round" />
      <path d="M7 16V9c0-1.7 1.3-3 3-3" strokeLinecap="round" />
      <path d="M17 12v2c0 2.8-2.2 5-5 5" strokeLinecap="round" />
      <path d="M17 9V8c0-2.2-1.8-4-4-4" strokeLinecap="round" />
    </svg>
  )
}

export function BackspaceIcon({ className = 'w-5 h-5', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
      <path d="M7 7h11a2 2 0 012 2v6a2 2 0 01-2 2H7l-4-4V11l4-4z" strokeLinejoin="round" />
      <path d="M13 10l-4 4M9 10l4 4" strokeLinecap="round" />
    </svg>
  )
}

export function ExpandIcon({ className = 'w-4 h-4', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
      <path d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3M16 21h3a2 2 0 002-2v-3" strokeLinecap="round" />
    </svg>
  )
}

export function ArrowUpIcon({ className = 'w-4 h-4', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
      <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowDownIcon({ className = 'w-4 h-4', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
      <path d="M12 5v14M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SwapTxIcon({ className = 'w-4 h-4', stroke = 'currentColor' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
      <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
