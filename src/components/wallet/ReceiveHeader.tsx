import { useNavigate } from 'react-router-dom'
import { CloseIcon } from './WalletIcons'

type Props = {
  onClose?: () => void
}

export function ReceiveHeader({ onClose }: Props) {
  const navigate = useNavigate()

  const close = () => {
    if (onClose) {
      onClose()
      return
    }
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3">
      <div className="w-11 shrink-0" aria-hidden />

      <h1 className="text-center text-[17px] font-semibold tracking-tight text-white drop-shadow-sm">
        Receive Crypto
      </h1>

      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className="wallet-icon-btn shrink-0 bg-white/20 text-white backdrop-blur-sm transition-transform active:scale-95"
      >
        <CloseIcon />
      </button>
    </header>
  )
}
