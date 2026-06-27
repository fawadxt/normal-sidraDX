import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon } from './WalletIcons'

type Props = {
  title: string
  backTo?: string
  right?: ReactNode
}

export function PageHeader({ title, backTo = '/', right }: Props) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-[var(--premium-bg-elevated)]/90 px-5 py-4 backdrop-blur-xl">
      <Link
        to={backTo}
        className="wallet-icon-btn wallet-icon-btn-premium transition-transform active:scale-95"
        aria-label="Go back"
      >
        <ChevronLeftIcon />
      </Link>
      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-[var(--premium-text)]">{title}</h1>
      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  )
}
