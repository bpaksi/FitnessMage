'use client'

import { useEffect, useRef, useState } from 'react'

interface QrScannerProps {
  onScan: (value: string) => void
  onError?: (error: string) => void
}

export function QrScanner({ onScan, onError }: QrScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null)
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    let mounted = true

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (!mounted || !containerRef.current) return

        const scanner = new Html5Qrcode('qr-reader')
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText)
          },
          () => {
            // Ignore scan failures (normal while scanning)
          },
        )
        if (mounted) setIsStarted(true)
      } catch (err) {
        if (mounted) {
          onError?.(err instanceof Error ? err.message : 'Camera access denied')
        }
      }
    }

    startScanner()

    return () => {
      mounted = false
      if (scannerRef.current && isStarted) {
        scannerRef.current.stop().catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div id="qr-reader" ref={containerRef} className="w-full overflow-hidden rounded-lg" />
}
