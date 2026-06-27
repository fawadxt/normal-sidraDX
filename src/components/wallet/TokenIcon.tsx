import { useCallback, useState, type CSSProperties } from 'react'
import { bscChain } from '../../config/bscChain'
import { sidraChain } from '../../config/sidraChain'
import { getLocalTokenIconPath, tokenGradient, tokenIconLabel } from '../../lib/tokenAvatar'

type Props = {
  symbol: string
  chainId?: number
  className?: string
  size?: number
}

function SymbolAvatar({ symbol, size }: { symbol: string; size: number }) {
  const label = tokenIconLabel(symbol)
  const [c1, c2] = tokenGradient(symbol)
  const fontSize = label.length <= 2 ? size * 0.34 : label.length === 3 ? size * 0.26 : size * 0.22
  const gradId = `tg-${symbol.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill={`url(#${gradId})`} />
      <text
        x="16"
        y="20"
        textAnchor="middle"
        fill="#fff"
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    </svg>
  )
}

function TokenImage({ symbol, size }: { symbol: string; size: number }) {
  const [failed, setFailed] = useState(false)
  const src = getLocalTokenIconPath(symbol)
  const onError = useCallback(() => setFailed(true), [])

  if (failed) return <SymbolAvatar symbol={symbol} size={size} />

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      onError={onError}
    />
  )
}

export function TokenIcon({ symbol, chainId, className = '', size = 40 }: Props) {
  const style: CSSProperties = { width: size, height: size, flexShrink: 0 }
  const isBsc = chainId === bscChain.id
  const isSidra = !chainId || chainId === sidraChain.id

  const logo =
    isSidra || isBsc ? (
      <TokenImage symbol={symbol} size={size} />
    ) : (
      <SymbolAvatar symbol={symbol} size={size} />
    )

  return (
    <span className={`wallet-row-avatar overflow-hidden rounded-2xl ${className}`} style={style}>
      {logo}
    </span>
  )
}
