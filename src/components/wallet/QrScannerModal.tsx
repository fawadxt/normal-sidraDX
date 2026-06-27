import { Html5Qrcode } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'
import { CloseIcon } from './WalletIcons'

const SCANNER_ID = 'wallet-qr-scanner'

type Props = {
  onClose: () => void
  onScan: (text: string) => void
}

export function QrScannerModal({ onClose, onScan }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(true)

  useEffect(() => {
    let active = true
    const scanner = new Html5Qrcode(SCANNER_ID)
    scannerRef.current = scanner

    const start = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
          (decodedText) => {
            if (scannedRef.current) return
            scannedRef.current = true
            onScan(decodedText)
          },
          () => {
            // Ignore per-frame decode misses.
          },
        )
        if (active) setStarting(false)
      } catch {
        if (!active) return
        setStarting(false)
        setError('Camera access denied or unavailable. Allow camera permission and try again.')
      }
    }

    void start()

    return () => {
      active = false
      const instance = scannerRef.current
      scannerRef.current = null
      if (!instance) return
      void instance
        .stop()
        .then(() => instance.clear())
        .catch(() => {
          instance.clear()
        })
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black">
      <header className="flex items-center justify-between px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <div>
          <p className="text-base font-semibold text-white">Scan QR Code</p>
          <p className="text-xs text-white/70">Point camera at a wallet address QR</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close scanner"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </header>

      <div className="relative mx-5 flex-1 overflow-hidden rounded-[24px] bg-[#111111]">
        <div id={SCANNER_ID} className="h-full w-full [&>video]:h-full [&>video]:w-full [&>video]:object-cover" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-56 w-56 rounded-[24px] border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
        </div>

        {(starting || error) && (
          <div className="absolute inset-x-0 bottom-0 bg-black/70 px-4 py-3 text-center text-xs text-white">
            {error ?? 'Starting camera...'}
          </div>
        )}
      </div>

      <p className="px-5 py-4 text-center text-[11px] text-white/60">
        Scan a Sidra or Ethereum wallet address to send crypto
      </p>
    </div>
  )
}
