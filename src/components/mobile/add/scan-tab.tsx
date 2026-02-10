'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { apiClient } from '@/lib/mobile/api-client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FoodDetailCard } from './food-detail-card'
import type { Food } from '@/lib/types/food'

const QrScanner = dynamic(
  () => import('@/components/mobile/qr-scanner').then((mod) => ({ default: mod.QrScanner })),
  { ssr: false, loading: () => <div className="flex h-48 items-center justify-center text-sm text-[#64748b]">Loading camera...</div> },
)

interface ScanTabProps {
  onAddFood: (food: Food) => void
  onManualEntry: (barcode?: string) => void
}

export function ScanTab({ onAddFood, onManualEntry }: ScanTabProps) {
  const [scannedFood, setScannedFood] = useState<Food | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
      <div className="space-y-3">
        <FoodDetailCard food={scannedFood} onAdd={onAddFood} />
        <button
          onClick={() => {
            setScannedFood(null)
            setLastScannedCode('')
          }}
          className="block w-full text-center text-sm text-[#64748b] hover:text-[#94a3b8]"
        >
          Scan another
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {cameraError ? (
        <div className="rounded-lg border border-[#1e293b] bg-[#0f172a] p-6 text-center">
          <p className="mb-3 text-sm text-[#64748b]">Camera not available</p>
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
        </div>
      ) : (
        <QrScanner
          onScan={lookupBarcode}
          onError={(err) => setCameraError(err)}
        />
      )}

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-[#1e293b] bg-[#0f172a] p-4 text-center">
          <p className="mb-3 text-sm text-[#64748b]">{error}</p>
          <Button
            variant="outline"
            onClick={() => onManualEntry(lastScannedCode)}
            className="border-[#1e293b] text-[#94a3b8]"
          >
            Enter manually
          </Button>
        </div>
      )}
    </div>
  )
}
