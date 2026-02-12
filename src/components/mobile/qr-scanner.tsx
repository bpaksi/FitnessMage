'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const SCAN_TIMEOUT_MS = 15_000
const DETECT_INTERVAL_MS = 300

interface QrScannerProps {
  onScan: (value: string) => void
  onError?: (error: string) => void
  onTimeout?: () => void
}

export function QrScanner({ onScan, onError, onTimeout }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)
  const metaTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const scannedRef = useRef(false)
  const [elapsed, setElapsed] = useState(0)
  const [scanning, setScanning] = useState(false)

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (metaTimerRef.current) {
      clearTimeout(metaTimerRef.current)
      metaTimerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = null
      videoRef.current.srcObject = null
    }
  }, [])

  // Timeout countdown
  useEffect(() => {
    if (!scanning) return
    const start = Date.now()
    const timer = setInterval(() => {
      const ms = Date.now() - start
      setElapsed(ms)
      if (ms >= SCAN_TIMEOUT_MS) {
        clearInterval(timer)
        cleanup()
        onTimeout?.()
      }
    }, 200)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning, cleanup])

  useEffect(() => {
    let mounted = true

    async function start() {
      try {
        if (!window.isSecureContext) {
          onError?.('Camera requires HTTPS or localhost.')
          return
        }
        if (!navigator.mediaDevices?.getUserMedia) {
          onError?.('Camera API not supported in this browser.')
          return
        }

        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream

        const video = videoRef.current
        if (!video) return
        video.srcObject = stream

        // Wait for stream metadata before playing — prevents hang on mobile Safari
        if (video.readyState < video.HAVE_METADATA) {
          await new Promise<void>((resolve, reject) => {
            metaTimerRef.current = setTimeout(() => {
              metaTimerRef.current = null
              reject(new Error('Camera stream timed out'))
            }, 10_000)
            video.onloadedmetadata = () => {
              if (metaTimerRef.current) {
                clearTimeout(metaTimerRef.current)
                metaTimerRef.current = null
              }
              resolve()
            }
          })
        }
        await video.play()
        if (!mounted) return

        // Build detector — native or ZXing fallback
        let detect: (v: HTMLVideoElement) => Promise<string | null>

        if ('BarcodeDetector' in globalThis) {
          const detector = new BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
          })
          detect = async (v) => {
            const results = await detector.detect(v)
            return results.length > 0 ? results[0].rawValue : null
          }
        } else {
          // ZXing fallback — decode from canvas snapshots
          const { BrowserMultiFormatReader, BarcodeFormat } = await import('@zxing/browser')
          const { DecodeHintType } = await import('@zxing/library')
          const hints = new Map()
          hints.set(DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.EAN_13,
            BarcodeFormat.EAN_8,
            BarcodeFormat.UPC_A,
            BarcodeFormat.UPC_E,
            BarcodeFormat.CODE_128,
          ])
          hints.set(DecodeHintType.TRY_HARDER, true)
          const reader = new BrowserMultiFormatReader()
          reader.setHints(hints)
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!

          detect = async (v) => {
            if (!v.videoWidth) return null
            canvas.width = v.videoWidth
            canvas.height = v.videoHeight
            ctx.drawImage(v, 0, 0)
            try {
              const result = reader.decodeFromCanvas(canvas)
              return result.getText()
            } catch {
              return null
            }
          }
        }

        if (!mounted) return
        setScanning(true)

        // Poll for barcodes
        intervalRef.current = setInterval(async () => {
          if (scannedRef.current || !video.videoWidth) return
          try {
            const value = await detect(video)
            if (value && !scannedRef.current) {
              scannedRef.current = true
              cleanup()
              onScan(value)
            }
          } catch {
            // Individual frame failures are normal
          }
        }, DETECT_INTERVAL_MS)
      } catch (err) {
        if (!mounted) return
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('Permission') || msg.includes('denied') || msg.includes('NotAllowed')) {
          onError?.('Camera permission denied. Allow camera access in browser settings.')
        } else {
          onError?.(msg || 'Could not start camera.')
        }
      }
    }

    start()

    return () => {
      mounted = false
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const progress = Math.min(elapsed / SCAN_TIMEOUT_MS, 1)
  const secondsLeft = Math.max(0, Math.ceil((SCAN_TIMEOUT_MS - elapsed) / 1000))

  return (
    <div className="relative -mx-4 overflow-hidden bg-black" style={{ height: '60svh' }}>
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted
      />

      {/* Scan guide overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between py-4">
        <span className="rounded-full bg-black/60 px-3 py-1.5 text-sm text-white/90">
          Align barcode in the frame
        </span>

        {/* Scan line guide */}
        <div className="absolute left-[5%] right-[5%] top-1/2 -translate-y-1/2">
          <div className="h-px bg-[#ef4444]/70" />
        </div>

        <div className="space-y-2">
          {scanning && (
            <div className="mx-auto w-48 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-1.5 rounded-full bg-[#3b82f6] transition-all duration-200 ease-linear"
                style={{ width: `${(1 - progress) * 100}%` }}
              />
            </div>
          )}
          <div className="flex items-center justify-center gap-2 rounded-full bg-black/60 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#22c55e] motion-safe:animate-pulse" />
            <span className="text-xs text-white/80">
              {scanning ? `Scanning... ${secondsLeft}s` : 'Starting camera...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
