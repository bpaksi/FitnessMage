'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { Food } from '@/lib/types/food'

const QrScanner = dynamic(
  () => import('@/components/mobile/qr-scanner').then((mod) => ({ default: mod.QrScanner })),
  { ssr: false, loading: () => <div className="flex h-48 items-center justify-center text-sm text-[#64748b]">Loading camera...</div> },
)

interface FoodEditorProps {
  food?: Food | null
  onSaved: () => void
  onBack: () => void
}

// --- Scan Tab (web version) ---

function ScanSection({ onFoodScanned, onManualEntry }: {
  onFoodScanned: (food: Food) => void
  onManualEntry: (barcode?: string) => void
}) {
  const [scannedFood, setScannedFood] = useState<Food | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cameraError, setCameraError] = useState('')
  const [manualBarcode, setManualBarcode] = useState('')
  const [lastScannedCode, setLastScannedCode] = useState('')
  const [saving, setSaving] = useState(false)

  async function lookupBarcode(code: string) {
    if (code === lastScannedCode) return
    setLastScannedCode(code)
    setLoading(true)
    setError('')
    setScannedFood(null)

    try {
      const res = await fetch(`/api/foods/barcode?code=${encodeURIComponent(code)}`)
      if (!res.ok) throw new Error('Product not found')
      const food = await res.json()
      setScannedFood(food)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product not found')
    } finally {
      setLoading(false)
    }
  }

  async function saveToLibrary(food: Food) {
    setSaving(true)
    try {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: food.name,
          brand: food.brand || undefined,
          serving_size: food.serving_size || '1 serving',
          barcode: food.barcode || undefined,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber ?? undefined,
          sugar: food.sugar ?? undefined,
          sodium: food.sodium ?? undefined,
          saturated_fat: food.saturated_fat ?? undefined,
          trans_fat: food.trans_fat ?? undefined,
          cholesterol: food.cholesterol ?? undefined,
          potassium: food.potassium ?? undefined,
          vitamin_d: food.vitamin_d ?? undefined,
          calcium: food.calcium ?? undefined,
          iron: food.iron ?? undefined,
        }),
      })
      if (res.ok) {
        toast.success('Food saved to library')
        onFoodScanned(await res.json())
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  if (scannedFood) {
    return (
      <div className="rounded-lg border border-[#1e293b] bg-[#0f172a] p-4">
        <h3 className="text-sm font-medium text-[#f8fafc]">
          {scannedFood.name} ({scannedFood.serving_size})
        </h3>
        {scannedFood.brand && <p className="mt-0.5 text-xs text-[#64748b]">{scannedFood.brand}</p>}

        <div className="mt-3 grid grid-cols-4 gap-2">
          <div className="text-center">
            <p className="text-xs text-[#64748b]">Cal</p>
            <p className="text-sm font-medium text-[#22c55e]">{scannedFood.calories}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#64748b]">Protein</p>
            <p className="text-sm font-medium text-[#ef4444]">{scannedFood.protein}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#64748b]">Carbs</p>
            <p className="text-sm font-medium text-[#3b82f6]">{scannedFood.carbs}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#64748b]">Fat</p>
            <p className="text-sm font-medium text-[#eab308]">{scannedFood.fat}g</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setScannedFood(null)
              setLastScannedCode('')
            }}
            className="flex-1 border-[#1e293b] text-[#94a3b8]"
          >
            Wrong item
          </Button>
          <Button
            onClick={() => saveToLibrary(scannedFood)}
            disabled={saving}
            className="flex-1 bg-[#3b82f6] text-white hover:bg-[#2563eb]"
          >
            {saving ? 'Saving...' : 'Save to Library'}
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[#1e293b] bg-[#0f172a] p-4">
        <div className="flex flex-col items-center py-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="mt-3 text-sm font-medium text-[#f8fafc]">Could not scan barcode</p>
          <p className="mt-1 text-xs text-[#64748b]">We couldn&apos;t find this product in our database</p>
        </div>

        <div className="mt-2 flex gap-2">
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
    </div>
  )
}

// --- Manual Form ---

function ManualForm({ food, initialBarcode, onSaved }: {
  food?: Food | null
  initialBarcode?: string
  onSaved: () => void
}) {
  const isEdit = !!food

  const [name, setName] = useState(food?.name || '')
  const [brand, setBrand] = useState(food?.brand || '')
  const [servingSize, setServingSize] = useState(food?.serving_size || '')
  const [barcode, setBarcode] = useState(food?.barcode || initialBarcode || '')
  const [calories, setCalories] = useState(food?.calories ?? '')
  const [protein, setProtein] = useState(food?.protein ?? '')
  const [carbs, setCarbs] = useState(food?.carbs ?? '')
  const [fat, setFat] = useState(food?.fat ?? '')

  const [fiber, setFiber] = useState<number | string>(food?.fiber ?? '')
  const [sugar, setSugar] = useState<number | string>(food?.sugar ?? '')
  const [sodium, setSodium] = useState<number | string>(food?.sodium ?? '')
  const [saturatedFat, setSaturatedFat] = useState<number | string>(food?.saturated_fat ?? '')
  const [transFat, setTransFat] = useState<number | string>(food?.trans_fat ?? '')
  const [cholesterol, setCholesterol] = useState<number | string>(food?.cholesterol ?? '')
  const [potassium, setPotassium] = useState<number | string>(food?.potassium ?? '')
  const [vitaminD, setVitaminD] = useState<number | string>(food?.vitamin_d ?? '')
  const [calcium, setCalcium] = useState<number | string>(food?.calcium ?? '')
  const [iron, setIron] = useState<number | string>(food?.iron ?? '')

  const [moreOpen, setMoreOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  const hasExtended = food && (
    food.fiber != null || food.sugar != null || food.sodium != null ||
    food.saturated_fat != null || food.trans_fat != null || food.cholesterol != null ||
    food.potassium != null || food.vitamin_d != null || food.calcium != null || food.iron != null
  )

  // Auto-open collapsible when editing a food with extended data
  useState(() => {
    if (hasExtended) setMoreOpen(true)
  })

  function numOrUndefined(v: number | string): number | undefined {
    if (v === '' || v === undefined || v === null) return undefined
    const n = Number(v)
    return isNaN(n) ? undefined : n
  }

  async function handleSave() {
    if (!name.trim() || !servingSize.trim()) {
      toast.error('Name and serving size are required')
      return
    }

    setSaving(true)
    try {
      const body = {
        name: name.trim(),
        brand: brand.trim() || undefined,
        serving_size: servingSize.trim(),
        barcode: barcode.trim() || undefined,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        fiber: numOrUndefined(fiber),
        sugar: numOrUndefined(sugar),
        sodium: numOrUndefined(sodium),
        saturated_fat: numOrUndefined(saturatedFat),
        trans_fat: numOrUndefined(transFat),
        cholesterol: numOrUndefined(cholesterol),
        potassium: numOrUndefined(potassium),
        vitamin_d: numOrUndefined(vitaminD),
        calcium: numOrUndefined(calcium),
        iron: numOrUndefined(iron),
      }

      const res = isEdit
        ? await fetch(`/api/foods/${food.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/foods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

      if (res.ok) {
        toast.success(isEdit ? 'Food updated' : 'Food created')
        onSaved()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'border-[#1e293b] bg-[#020817] text-[#f8fafc]'

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-[#94a3b8]">Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chicken Breast"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[#94a3b8]">Brand (optional)</Label>
        <Input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g. Tyson"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[#94a3b8]">Serving Size</Label>
        <Input
          value={servingSize}
          onChange={(e) => setServingSize(e.target.value)}
          placeholder="e.g. 100g"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[#94a3b8]">Calories</Label>
          <Input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[#94a3b8]">Protein (g)</Label>
          <Input
            type="number"
            step="0.1"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[#94a3b8]">Carbs (g)</Label>
          <Input
            type="number"
            step="0.1"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[#94a3b8]">Fat (g)</Label>
          <Input
            type="number"
            step="0.1"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </div>
      </div>

      <Collapsible open={moreOpen} onOpenChange={(open) => {
        setMoreOpen(open)
        if (open) {
          setTimeout(() => moreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
        }
      }}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 py-2 text-sm text-[#94a3b8] transition-colors hover:text-[#f8fafc]">
          <ChevronDown size={16} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
          More Nutrition (optional)
        </CollapsibleTrigger>
        <CollapsibleContent ref={moreRef} className="space-y-3 pt-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Fiber (g)</Label>
              <Input type="number" step="0.1" value={fiber} onChange={(e) => setFiber(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Sugar (g)</Label>
              <Input type="number" step="0.1" value={sugar} onChange={(e) => setSugar(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Sodium (mg)</Label>
              <Input type="number" step="1" value={sodium} onChange={(e) => setSodium(e.target.value)} placeholder="0" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Sat. Fat (g)</Label>
              <Input type="number" step="0.1" value={saturatedFat} onChange={(e) => setSaturatedFat(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Trans Fat (g)</Label>
              <Input type="number" step="0.1" value={transFat} onChange={(e) => setTransFat(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Cholesterol (mg)</Label>
              <Input type="number" step="1" value={cholesterol} onChange={(e) => setCholesterol(e.target.value)} placeholder="0" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Potassium (mg)</Label>
              <Input type="number" step="1" value={potassium} onChange={(e) => setPotassium(e.target.value)} placeholder="0" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Vitamin D (mcg)</Label>
              <Input type="number" step="0.1" value={vitaminD} onChange={(e) => setVitaminD(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Calcium (mg)</Label>
              <Input type="number" step="1" value={calcium} onChange={(e) => setCalcium(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Iron (mg)</Label>
              <Input type="number" step="0.1" value={iron} onChange={(e) => setIron(e.target.value)} placeholder="0" className={inputClass} />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {(barcode || initialBarcode) && (
        <div className="space-y-1.5">
          <Label className="text-[#94a3b8]">Barcode</Label>
          <Input
            value={barcode}
            readOnly={!!initialBarcode}
            onChange={(e) => setBarcode(e.target.value)}
            className={`${inputClass} ${initialBarcode ? 'opacity-60' : ''}`}
          />
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[#3b82f6] text-white hover:bg-[#2563eb]"
      >
        {saving ? 'Saving...' : isEdit ? 'Update Food' : 'Create Food'}
      </Button>
    </div>
  )
}

// --- Main FoodEditor ---

export function FoodEditor({ food, onSaved }: FoodEditorProps) {
  const isEdit = !!food
  const [activeTab, setActiveTab] = useState('manual')
  const [initialBarcode, setInitialBarcode] = useState('')

  function handleManualEntry(barcode?: string) {
    if (barcode) setInitialBarcode(barcode)
    setActiveTab('manual')
  }

  if (isEdit) {
    return (
      <div className="max-w-lg">
        <ManualForm food={food} onSaved={onSaved} />
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-[#0f172a]">
          <TabsTrigger value="scan" className="data-[state=active]:bg-[#1e293b] data-[state=active]:text-[#f8fafc]">
            Scan
          </TabsTrigger>
          <TabsTrigger value="manual" className="data-[state=active]:bg-[#1e293b] data-[state=active]:text-[#f8fafc]">
            Manual
          </TabsTrigger>
        </TabsList>
        <TabsContent value="scan" className="mt-4">
          <ScanSection
            onFoodScanned={() => onSaved()}
            onManualEntry={handleManualEntry}
          />
        </TabsContent>
        <TabsContent value="manual" className="mt-4">
          <ManualForm initialBarcode={initialBarcode} onSaved={onSaved} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
