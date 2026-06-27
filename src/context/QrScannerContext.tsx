import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { QrScannerModal } from '../components/wallet/QrScannerModal'

type ScanHandler = (text: string) => void

type QrScannerContextValue = {
  openScanner: (onScan: ScanHandler) => void
}

const QrScannerContext = createContext<QrScannerContextValue | null>(null)

export function QrScannerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const handlerRef = useRef<ScanHandler | null>(null)

  const openScanner = useCallback((onScan: ScanHandler) => {
    handlerRef.current = onScan
    setOpen(true)
  }, [])

  const closeScanner = useCallback(() => {
    setOpen(false)
    handlerRef.current = null
  }, [])

  const handleScan = useCallback(
    (text: string) => {
      handlerRef.current?.(text)
      closeScanner()
    },
    [closeScanner],
  )

  return (
    <QrScannerContext.Provider value={{ openScanner }}>
      {children}
      {open ? <QrScannerModal onClose={closeScanner} onScan={handleScan} /> : null}
    </QrScannerContext.Provider>
  )
}

export function useQrScanner() {
  const ctx = useContext(QrScannerContext)
  if (!ctx) {
    throw new Error('useQrScanner must be used within QrScannerProvider')
  }
  return ctx
}
