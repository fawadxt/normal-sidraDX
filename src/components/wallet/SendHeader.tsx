import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloseIcon } from './WalletIcons'

type SendMode = 'transfer'

type Props = {
  onClose?: () => void
}

export function SendHeader({ onClose }: Props) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const mode: SendMode = 'transfer'

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [menuOpen])

  const close = () => {
    if (onClose) {
      onClose()
      return
    }
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.04] bg-[#FAFAFA]/92 px-5 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1 text-left"
            aria-expanded={menuOpen}
            aria-haspopup="listbox"
          >
            <span className="text-lg font-semibold text-[#111111]">Send</span>
            <svg
              className={`h-4 w-4 text-[#A67C00] transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="text-[11px] font-medium text-[#777777]">Transfer</p>

          {menuOpen && (
            <div
              role="listbox"
              className="absolute left-0 top-full z-40 mt-2 min-w-[10rem] overflow-hidden rounded-[16px] border border-[#D4AF37]/20 bg-white py-1 shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
            >
              <button
                type="button"
                role="option"
                aria-selected={mode === 'transfer'}
                className="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium text-[#A67C00] bg-[#FFF9E6]"
                onClick={() => setMenuOpen(false)}
              >
                Transfer
              </button>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1" aria-hidden />

        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="wallet-icon-btn shrink-0 bg-white text-[#A67C00] shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-transform active:scale-95"
        >
          <CloseIcon />
        </button>
      </div>
    </header>
  )
}
