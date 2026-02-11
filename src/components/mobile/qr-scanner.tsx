'use client'

import { useEffect, useRef } from 'react'

interface QrScannerProps {
  onScan: (value: string) => void
  onError?: (error: string) => void
}

export function QrScanner({ onScan, onError }: QrScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    let mounted = true

    async function startScanner() {
      try {
        // Check for secure context (getUserMedia requires HTTPS or localhost)
        if (!window.isSecureContext) {
          onError?.('Camera requires HTTPS. Access this app via HTTPS or localhost.')
          return
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          onError?.('Camera API not supported in this browser.')
          return
        }

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
        if (mounted) startedRef.current = true
      } catch (err) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'Camera access denied'
          if (message.includes('Permission') || message.includes('denied')) {
            onError?.('Camera permission denied. Allow camera access in browser settings.')
          } else {
            onError?.(message)
          }
        }
      }
    }

    startScanner()

    return () => {
      mounted = false
      if (scannerRef.current && startedRef.current) {
        scannerRef.current.stop().catch(() => {})
        startedRef.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <div id="qr-reader" ref={containerRef} className="w-full" />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between py-4">
        <span className="rounded-full bg-black/60 px-3 py-1.5 text-sm text-white/90">
          Point camera at a barcode
        </span>
        <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-[#22c55e] motion-safe:animate-pulse" />
          <span className="text-xs text-white/80">Scanning automatically</span>
        </div>
      </div>
    </div>
  )
}
