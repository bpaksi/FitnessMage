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
  onAddFood: (food: Food, servings?: number) => void
  onManualEntry: (barcode?: string) => void
  onCancel: () => void
}

export function ScanTab({ onAddFood, onManualEntry, onCancel }: ScanTabProps) {
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

      {error && (
        <div className="rounded-lg border border-[#1e293b] bg-[#0f172a] p-4 text-center">
          <p className="text-sm font-medium text-[#f8fafc]">Barcode not found</p>
          <p className="mt-1 text-xs text-[#64748b]">We couldn&apos;t find this product in our database</p>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setError('')
                setLastScannedCode('')
              }}
              className="flex-1 border-[#1e293b] text-[#94a3b8]"
            >
              Try again
            </Button>
            <Button
              onClick={() => onManualEntry(lastScannedCode)}
              className="flex-1 bg-[#3b82f6] text-white hover:bg-[#2563eb]"
            >
              Enter manually
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
