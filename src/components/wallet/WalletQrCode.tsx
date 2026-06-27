import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { BRAND } from '../../config/brand'

const GOLD = '#A67C00'
const LOGO_SRC = BRAND.iconPath

export type WalletQrCodeHandle = {
  getSvgElement: () => SVGSVGElement | null
}

type Props = {
  address: string
  size?: number
  fgColor?: string
}

export const WalletQrCode = forwardRef<WalletQrCodeHandle, Props>(function WalletQrCode(
  { address, size: maxSize = 220, fgColor = GOLD },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState(maxSize)

  useImperativeHandle(ref, () => ({
    getSvgElement: () => svgRef.current,
  }))

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const width = el.clientWidth
      if (width > 0) setSize(Math.min(maxSize, Math.floor(width)))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [maxSize])

  const logoSize = Math.max(24, Math.round(size * 0.2))

  return (
    <div ref={containerRef} className="wallet-qr-container">
      <QRCodeSVG
        ref={svgRef}
        value={address}
        size={size}
        level="H"
        fgColor={fgColor}
        bgColor="#FFFFFF"
        marginSize={1}
        imageSettings={{
          src: LOGO_SRC,
          height: logoSize,
          width: logoSize,
          excavate: true,
        }}
        className="h-auto w-full rounded-2xl"
      />
    </div>
  )
})

export async function downloadQrPng(svg: SVGSVGElement, filename = 'sidra-receive-qr.png') {
  const svgData = new XMLSerializer().serializeToString(svg)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  await new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const padding = 32
      canvas.width = img.width + padding * 2
      canvas.height = img.height + padding * 2
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas unavailable'))
        return
      }
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, padding, padding)
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Export failed'))
          return
        }
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.click()
        URL.revokeObjectURL(link.href)
        resolve()
      }, 'image/png')
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('QR image load failed'))
    }
    img.src = url
  })
}
