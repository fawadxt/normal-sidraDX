import { sidraChain } from '../config/sidraChain'

export function txExplorerUrl(hash: string): string {
  return `${sidraChain.blockExplorers.default.url}/tx/${hash}`
}

function shortHash(hash: string): string {
  if (hash.length < 18) return hash
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`
}

type Props = {
  hash: string
  label: string
  className?: string
}

export function TxExplorerLink({ hash, label, className = '' }: Props) {
  return (
    <a
      href={txExplorerUrl(hash)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors ${className}`}
    >
      <span className="text-slate-400">{label}:</span>
      <span className="font-mono">{shortHash(hash)}</span>
      <span className="text-[10px] leading-none" aria-hidden>
        ↗
      </span>
    </a>
  )
}
