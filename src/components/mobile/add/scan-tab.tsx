'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { apiClient } from '@/lib/mobile/api-client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FoodDetailCard } from './food-detail-card'
import type { Food } from '@/lib/types/food'

const QrScanner = dynamic(
  () =>
    import('@/components/mobile/qr-scanner').then((mod) => ({ default: mod.QrScanner })).catch(() => ({
      default: ({ onError }: { onError?: (e: string) => void }) => {
        onError?.('Failed to load camera. Please refresh and try again.')
        return null
      },
    })),
  { ssr: false, loading: () => <div className="flex items-center justify-center bg-black text-sm text-[#64748b]" style={{ height: '60svh' }}>Starting camera...</div> },
)

interface ScanTabProps {
  onAddFood: (food: Food, servings?: number) => void
  onManualEntry: (barcode?: string) => void
  onCancel: () => void
}

export function ScanTab({ onAddFood, onManualEntry, onCancel }: ScanTabProps) {
  const [scannedFood, setScannedFood] = useState<Food | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timedOut, setTimedOut] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [manualBarcode, setManualBarcode] = useState('')
  const [lastScannedCode, setLastScannedCode] = useState('')

  async function lookupBarcode(code: string) {
    if (code === lastScannedCode) return
    setLastScannedCode(code)
    setLoading(true)
    setError('')
    setScannedFood(null)

    try {
      const food = await apiClient<Food>(`/api/foods/barcode?code=${encodeURIComponent(code)}`)
      setScannedFood(food)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product not found')
    } finally {
      setLoading(false)
    }
  }

  if (scannedFood) {
    return (
      <FoodDetailCard
        food={scannedFood}
        onAdd={(food, servings) => onAddFood(food, servings)}
        onCancel={() => {
          setScannedFood(null)
          setLastScannedCode('')
        }}
      />
    )
  }

  if (error || timedOut) {
    const title = error ? 'Product not found' : 'No barcode detected'
    const subtitle = error
      ? 'We couldn\u0027t find this product in our database'
      : 'Try holding the camera steady with the barcode inside the rectangle'

    return (
      <div className="rounded-lg border border-[#1e293b] bg-[#0f172a] p-4">
        <div className="flex flex-col items-center py-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="mt-3 text-sm font-medium text-[#f8fafc]">{title}</p>
          {lastScannedCode && (
            <p className="mt-1.5 rounded bg-[#020817] px-2.5 py-1 font-mono text-xs text-[#94a3b8] tabular-nums">
              {lastScannedCode}
            </p>
          )}
          <p className="mt-1 text-center text-xs text-[#64748b]">{subtitle}</p>
        </div>

        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setError('')
              setTimedOut(false)
              setLastScannedCode('')
            }}
            className="flex-1 border-[#1e293b] text-[#94a3b8]"
          >
            Try again
          </Button>
          <Button
            onClick={() => onManualEntry(lastScannedCode || undefined)}
            className="flex-1 bg-[#3b82f6] text-white hover:bg-[#2563eb]"
          >
            Enter manually
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {cameraError ? (
        <div className="rounded-lg border border-[#1e293b] bg-[#0f172a] p-6 text-center">
          <p className="mb-3 text-sm text-[#64748b]">{cameraError}</p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter barcode"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
            />
            <Button
              onClick={() => lookupBarcode(manualBarcode)}
              disabled={!manualBarcode}
              className="bg-[#3b82f6] text-white"
            >
              Look Up
            </Button>
          </div>
          <button
            onClick={onCancel}
            className="mt-3 text-sm text-[#64748b] hover:text-[#94a3b8]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <QrScanner
            onScan={lookupBarcode}
            onError={(err) => setCameraError(err)}
            onTimeout={() => setTimedOut(true)}
          />
          <button
            onClick={onCancel}
            className="block w-full text-center text-sm text-[#64748b] hover:text-[#94a3b8]"
          >
            Cancel
          </button>
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
        </div>
      )}
    </div>
  )
}
