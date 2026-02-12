'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Pill, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { Food } from '@/lib/types/food'

interface FoodEditorProps {
  food?: Food | null
  onSaved: () => void
  onBack: () => void
}

// --- Search Tab ---

function SearchSection({ onFoodSelected }: {
  onFoodSelected: (food: Food) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}`)
        if (res.ok) setResults(await res.json())
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
        <Input
          placeholder="Search foods and brands..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-[#1e293b] bg-[#020817] pl-9 text-[#f8fafc]"
          autoFocus
        />
      </div>
      {query.length < 2 ? (
        <p className="py-8 text-center text-sm text-[#64748b]">
          Search the USDA database to quickly add foods
        </p>
      ) : searching ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
        </div>
      ) : results.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#64748b]">No foods found</p>
      ) : (
        <div className="space-y-2">
          {results.map((food) => (
            <button
              key={food.id}
              onClick={() => onFoodSelected(food)}
              className="w-full rounded-md border border-[#1e293b] p-3 text-left transition-colors hover:bg-[#020817]"
            >
              <p className="text-sm font-medium text-[#f8fafc]">
                {food.name} ({food.serving_size})
              </p>
              {food.brand && <p className="text-xs text-[#64748b]">{food.brand}</p>}
              <div className="mt-1 flex gap-3 text-xs">
                <span className="text-[#22c55e]">{food.calories} cal</span>
                <span className="text-[#ef4444]">{food.protein}g P</span>
                <span className="text-[#3b82f6]">{food.carbs}g C</span>
                <span className="text-[#eab308]">{food.fat}g F</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Manual Form ---

function ManualForm({ food, prefill, onSaved }: {
  food?: Food | null
  prefill?: Food | null
  onSaved: () => void
}) {
  const isEdit = !!food
  const src = food || prefill

  const [category, setCategory] = useState<'food' | 'supplement'>(src?.category || 'food')
  const [name, setName] = useState(src?.name || '')
  const [brand, setBrand] = useState(src?.brand || '')
  const [servingSize, setServingSize] = useState(src?.serving_size || '')
  const [barcode, setBarcode] = useState(src?.barcode || '')
  const [calories, setCalories] = useState(src?.calories ?? '')
  const [protein, setProtein] = useState(src?.protein ?? '')
  const [carbs, setCarbs] = useState(src?.carbs ?? '')
  const [fat, setFat] = useState(src?.fat ?? '')

  const [fiber, setFiber] = useState<number | string>(src?.fiber ?? '')
  const [sugar, setSugar] = useState<number | string>(src?.sugar ?? '')
  const [sodium, setSodium] = useState<number | string>(src?.sodium ?? '')
  const [saturatedFat, setSaturatedFat] = useState<number | string>(src?.saturated_fat ?? '')
  const [transFat, setTransFat] = useState<number | string>(src?.trans_fat ?? '')
  const [cholesterol, setCholesterol] = useState<number | string>(src?.cholesterol ?? '')
  const [potassium, setPotassium] = useState<number | string>(src?.potassium ?? '')
  const [vitaminD, setVitaminD] = useState<number | string>(src?.vitamin_d ?? '')
  const [calcium, setCalcium] = useState<number | string>(src?.calcium ?? '')
  const [iron, setIron] = useState<number | string>(src?.iron ?? '')

  // Expanded nutrient state
  const [vitaminA, setVitaminA] = useState<number | string>(src?.vitamin_a ?? '')
  const [vitaminC, setVitaminC] = useState<number | string>(src?.vitamin_c ?? '')
  const [vitaminE, setVitaminE] = useState<number | string>(src?.vitamin_e ?? '')
  const [vitaminK, setVitaminK] = useState<number | string>(src?.vitamin_k ?? '')
  const [thiamin, setThiamin] = useState<number | string>(src?.thiamin ?? '')
  const [riboflavin, setRiboflavin] = useState<number | string>(src?.riboflavin ?? '')
  const [niacin, setNiacin] = useState<number | string>(src?.niacin ?? '')
  const [vitaminB6, setVitaminB6] = useState<number | string>(src?.vitamin_b6 ?? '')
  const [folate, setFolate] = useState<number | string>(src?.folate ?? '')
  const [vitaminB12, setVitaminB12] = useState<number | string>(src?.vitamin_b12 ?? '')
  const [choline, setCholine] = useState<number | string>(src?.choline ?? '')
  const [magnesium, setMagnesium] = useState<number | string>(src?.magnesium ?? '')
  const [phosphorus, setPhosphorus] = useState<number | string>(src?.phosphorus ?? '')
  const [zinc, setZinc] = useState<number | string>(src?.zinc ?? '')
  const [copper, setCopper] = useState<number | string>(src?.copper ?? '')
  const [selenium, setSelenium] = useState<number | string>(src?.selenium ?? '')
  const [manganese, setManganese] = useState<number | string>(src?.manganese ?? '')
  const [monoFat, setMonoFat] = useState<number | string>(src?.monounsaturated_fat ?? '')
  const [polyFat, setPolyFat] = useState<number | string>(src?.polyunsaturated_fat ?? '')
  const [caffeine, setCaffeine] = useState<number | string>(src?.caffeine ?? '')

  const [moreOpen, setMoreOpen] = useState(false)
  const [extendedOpen, setExtendedOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const extendedRef = useRef<HTMLDivElement>(null)

  // Auto-open collapsibles when editing a food/supplement with existing data
  useState(() => {
    if (!src) return
    const cat = src.category || 'food'
    if (cat === 'supplement') {
      // Auto-open "More Vitamins" if any secondary vitamin/mineral has data
      const hasMoreVitMins = src.vitamin_a != null || src.vitamin_e != null || src.vitamin_k != null ||
        src.thiamin != null || src.riboflavin != null || src.niacin != null ||
        src.vitamin_b6 != null || src.choline != null || src.potassium != null ||
        src.selenium != null || src.copper != null || src.phosphorus != null ||
        src.manganese != null || src.sodium != null
      if (hasMoreVitMins) setMoreOpen(true)
      // Auto-open "Macros & Other" if any macro/other has data
      const hasMacros = src.calories != null || src.protein != null || src.carbs != null || src.fat != null ||
        src.fiber != null || src.sugar != null || src.cholesterol != null ||
        src.saturated_fat != null || src.trans_fat != null || src.caffeine != null ||
        src.monounsaturated_fat != null || src.polyunsaturated_fat != null
      if (hasMacros) setExtendedOpen(true)
    } else {
      // Auto-open "Basic Nutrition" if any basic nutrient has data
      const hasBasic = src.fiber != null || src.sugar != null || src.sodium != null ||
        src.saturated_fat != null || src.trans_fat != null || src.cholesterol != null ||
        src.potassium != null || src.vitamin_d != null || src.calcium != null || src.iron != null
      if (hasBasic) setMoreOpen(true)
      // Auto-open "Extended" if any extended nutrient has data
      const hasExtended = src.vitamin_a != null || src.vitamin_c != null || src.vitamin_e != null ||
        src.vitamin_k != null || src.thiamin != null || src.riboflavin != null ||
        src.niacin != null || src.vitamin_b6 != null || src.folate != null ||
        src.vitamin_b12 != null || src.choline != null ||
        src.magnesium != null || src.phosphorus != null || src.zinc != null ||
        src.copper != null || src.selenium != null || src.manganese != null ||
        src.monounsaturated_fat != null || src.polyunsaturated_fat != null ||
        src.caffeine != null
      if (hasExtended) setExtendedOpen(true)
    }
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
        category,
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
        vitamin_a: numOrUndefined(vitaminA),
        vitamin_c: numOrUndefined(vitaminC),
        vitamin_e: numOrUndefined(vitaminE),
        vitamin_k: numOrUndefined(vitaminK),
        thiamin: numOrUndefined(thiamin),
        riboflavin: numOrUndefined(riboflavin),
        niacin: numOrUndefined(niacin),
        vitamin_b6: numOrUndefined(vitaminB6),
        folate: numOrUndefined(folate),
        vitamin_b12: numOrUndefined(vitaminB12),
        choline: numOrUndefined(choline),
        magnesium: numOrUndefined(magnesium),
        phosphorus: numOrUndefined(phosphorus),
        zinc: numOrUndefined(zinc),
        copper: numOrUndefined(copper),
        selenium: numOrUndefined(selenium),
        manganese: numOrUndefined(manganese),
        monounsaturated_fat: numOrUndefined(monoFat),
        polyunsaturated_fat: numOrUndefined(polyFat),
        caffeine: numOrUndefined(caffeine),
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
  const isSupplement = category === 'supplement'

  return (
    <div className="space-y-4">
      {/* Category toggle */}
      <div className="flex gap-1 rounded-lg bg-[#0f172a] p-1">
        <button
          type="button"
          onClick={() => setCategory('food')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            category === 'food'
              ? 'bg-[#1e293b] text-[#f8fafc]'
              : 'text-[#64748b] hover:text-[#94a3b8]'
          }`}
        >
          Food
        </button>
        <button
          type="button"
          onClick={() => {
            setCategory('supplement')
            if (!servingSize) setServingSize('1 capsule')
          }}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            category === 'supplement'
              ? 'bg-[#1e293b] text-[#f8fafc]'
              : 'text-[#64748b] hover:text-[#94a3b8]'
          }`}
        >
          <Pill size={14} className="mr-1 inline" />
          Supplement
        </button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[#94a3b8]">Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isSupplement ? 'e.g. Daily Multivitamin' : 'e.g. Chicken Breast'}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[#94a3b8]">Brand (optional)</Label>
        <Input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder={isSupplement ? 'e.g. Nature Made' : 'e.g. Tyson'}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[#94a3b8]">Serving Size</Label>
        <Input
          value={servingSize}
          onChange={(e) => setServingSize(e.target.value)}
          placeholder={isSupplement ? 'e.g. 1 capsule' : 'e.g. 100g'}
          className={inputClass}
        />
      </div>

      {/* Category-specific primary fields and collapsible sections */}
      {isSupplement ? (
        <>
          {/* Supplement: primary vitamins & minerals */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Vitamin D (mcg)</Label>
              <Input type="number" step="0.1" value={vitaminD} onChange={(e) => setVitaminD(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Vitamin C (mg)</Label>
              <Input type="number" step="0.1" value={vitaminC} onChange={(e) => setVitaminC(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Vitamin B12 (mcg)</Label>
              <Input type="number" step="0.01" value={vitaminB12} onChange={(e) => setVitaminB12(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Calcium (mg)</Label>
              <Input type="number" step="1" value={calcium} onChange={(e) => setCalcium(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Iron (mg)</Label>
              <Input type="number" step="0.1" value={iron} onChange={(e) => setIron(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Magnesium (mg)</Label>
              <Input type="number" step="1" value={magnesium} onChange={(e) => setMagnesium(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Zinc (mg)</Label>
              <Input type="number" step="0.1" value={zinc} onChange={(e) => setZinc(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Folate (mcg)</Label>
              <Input type="number" step="1" value={folate} onChange={(e) => setFolate(e.target.value)} placeholder="0" className={inputClass} />
            </div>
          </div>

          {/* More Vitamins & Minerals */}
          <Collapsible open={moreOpen} onOpenChange={(open) => {
            setMoreOpen(open)
            if (open) {
              setTimeout(() => moreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
            }
          }}>
            <CollapsibleTrigger className="flex w-full items-center gap-2 py-2 text-sm text-[#94a3b8] transition-colors hover:text-[#f8fafc]">
              <ChevronDown size={16} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              More Vitamins & Minerals
            </CollapsibleTrigger>
            <CollapsibleContent ref={moreRef} className="space-y-4 pt-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Vitamin A (mcg)</Label>
                  <Input type="number" step="0.1" value={vitaminA} onChange={(e) => setVitaminA(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Vitamin E (mg)</Label>
                  <Input type="number" step="0.1" value={vitaminE} onChange={(e) => setVitaminE(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Vitamin K (mcg)</Label>
                  <Input type="number" step="0.1" value={vitaminK} onChange={(e) => setVitaminK(e.target.value)} placeholder="0" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Thiamin (mg)</Label>
                  <Input type="number" step="0.01" value={thiamin} onChange={(e) => setThiamin(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Riboflavin (mg)</Label>
                  <Input type="number" step="0.01" value={riboflavin} onChange={(e) => setRiboflavin(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Niacin (mg)</Label>
                  <Input type="number" step="0.1" value={niacin} onChange={(e) => setNiacin(e.target.value)} placeholder="0" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">B6 (mg)</Label>
                  <Input type="number" step="0.01" value={vitaminB6} onChange={(e) => setVitaminB6(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Choline (mg)</Label>
                  <Input type="number" step="1" value={choline} onChange={(e) => setCholine(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Potassium (mg)</Label>
                  <Input type="number" step="1" value={potassium} onChange={(e) => setPotassium(e.target.value)} placeholder="0" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Selenium (mcg)</Label>
                  <Input type="number" step="0.1" value={selenium} onChange={(e) => setSelenium(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Copper (mg)</Label>
                  <Input type="number" step="0.01" value={copper} onChange={(e) => setCopper(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Phosphorus (mg)</Label>
                  <Input type="number" step="1" value={phosphorus} onChange={(e) => setPhosphorus(e.target.value)} placeholder="0" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Manganese (mg)</Label>
                  <Input type="number" step="0.01" value={manganese} onChange={(e) => setManganese(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Sodium (mg)</Label>
                  <Input type="number" step="1" value={sodium} onChange={(e) => setSodium(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Macros & Other */}
          <Collapsible open={extendedOpen} onOpenChange={(open) => {
            setExtendedOpen(open)
            if (open) {
              setTimeout(() => extendedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
            }
          }}>
            <CollapsibleTrigger className="flex w-full items-center gap-2 py-2 text-sm text-[#94a3b8] transition-colors hover:text-[#f8fafc]">
              <ChevronDown size={16} className={`transition-transform ${extendedOpen ? 'rotate-180' : ''}`} />
              Macros & Other
            </CollapsibleTrigger>
            <CollapsibleContent ref={extendedRef} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Calories</Label>
                  <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Protein (g)</Label>
                  <Input type="number" step="0.1" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Carbs (g)</Label>
                  <Input type="number" step="0.1" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Fat (g)</Label>
                  <Input type="number" step="0.1" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="0" className={inputClass} />
                </div>
              </div>
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
                  <Label className="text-[#94a3b8] text-xs">Cholesterol (mg)</Label>
                  <Input type="number" step="1" value={cholesterol} onChange={(e) => setCholesterol(e.target.value)} placeholder="0" className={inputClass} />
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
                  <Label className="text-[#94a3b8] text-xs">Caffeine (mg)</Label>
                  <Input type="number" step="1" value={caffeine} onChange={(e) => setCaffeine(e.target.value)} placeholder="0" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Mono. Fat (g)</Label>
                  <Input type="number" step="0.1" value={monoFat} onChange={(e) => setMonoFat(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Poly. Fat (g)</Label>
                  <Input type="number" step="0.1" value={polyFat} onChange={(e) => setPolyFat(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      ) : (
        <>
          {/* Food: primary macros */}
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

          {/* Basic Nutrition */}
          <Collapsible open={moreOpen} onOpenChange={(open) => {
            setMoreOpen(open)
            if (open) {
              setTimeout(() => moreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
            }
          }}>
            <CollapsibleTrigger className="flex w-full items-center gap-2 py-2 text-sm text-[#94a3b8] transition-colors hover:text-[#f8fafc]">
              <ChevronDown size={16} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              Basic Nutrition
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
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Potassium (mg)</Label>
                  <Input type="number" step="1" value={potassium} onChange={(e) => setPotassium(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Vitamin D (mcg)</Label>
                  <Input type="number" step="0.1" value={vitaminD} onChange={(e) => setVitaminD(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Calcium (mg)</Label>
                  <Input type="number" step="1" value={calcium} onChange={(e) => setCalcium(e.target.value)} placeholder="0" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Iron (mg)</Label>
                  <Input type="number" step="0.1" value={iron} onChange={(e) => setIron(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div />
                <div />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Extended Nutrition */}
          <Collapsible open={extendedOpen} onOpenChange={(open) => {
            setExtendedOpen(open)
            if (open) {
              setTimeout(() => extendedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
            }
          }}>
            <CollapsibleTrigger className="flex w-full items-center gap-2 py-2 text-sm text-[#94a3b8] transition-colors hover:text-[#f8fafc]">
              <ChevronDown size={16} className={`transition-transform ${extendedOpen ? 'rotate-180' : ''}`} />
              Extended Nutrition
            </CollapsibleTrigger>
            <CollapsibleContent ref={extendedRef} className="space-y-4 pt-2">
              <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Vitamins</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Vitamin A (mcg)</Label>
                  <Input type="number" step="0.1" value={vitaminA} onChange={(e) => setVitaminA(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Vitamin C (mg)</Label>
                  <Input type="number" step="0.1" value={vitaminC} onChange={(e) => setVitaminC(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Vitamin E (mg)</Label>
                  <Input type="number" step="0.1" value={vitaminE} onChange={(e) => setVitaminE(e.target.value)} placeholder="0" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Vitamin K (mcg)</Label>
                  <Input type="number" step="0.1" value={vitaminK} onChange={(e) => setVitaminK(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Thiamin (mg)</Label>
                  <Input type="number" step="0.01" value={thiamin} onChange={(e) => setThiamin(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Riboflavin (mg)</Label>
                  <Input type="number" step="0.01" value={riboflavin} onChange={(e) => setRiboflavin(e.target.value)} placeholder="0" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Niacin (mg)</Label>
                  <Input type="number" step="0.1" value={niacin} onChange={(e) => setNiacin(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">B6 (mg)</Label>
                  <Input type="number" step="0.01" value={vitaminB6} onChange={(e) => setVitaminB6(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Folate (mcg)</Label>
                  <Input type="number" step="1" value={folate} onChange={(e) => setFolate(e.target.value)} placeholder="0" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">B12 (mcg)</Label>
                  <Input type="number" step="0.01" value={vitaminB12} onChange={(e) => setVitaminB12(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Choline (mg)</Label>
                  <Input type="number" step="1" value={choline} onChange={(e) => setCholine(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div />
              </div>

              <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Minerals</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Magnesium (mg)</Label>
                  <Input type="number" step="1" value={magnesium} onChange={(e) => setMagnesium(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Zinc (mg)</Label>
                  <Input type="number" step="0.1" value={zinc} onChange={(e) => setZinc(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Selenium (mcg)</Label>
                  <Input type="number" step="0.1" value={selenium} onChange={(e) => setSelenium(e.target.value)} placeholder="0" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Copper (mg)</Label>
                  <Input type="number" step="0.01" value={copper} onChange={(e) => setCopper(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Phosphorus (mg)</Label>
                  <Input type="number" step="1" value={phosphorus} onChange={(e) => setPhosphorus(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Manganese (mg)</Label>
                  <Input type="number" step="0.01" value={manganese} onChange={(e) => setManganese(e.target.value)} placeholder="0" className={inputClass} />
                </div>
              </div>

              <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Other</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Caffeine (mg)</Label>
                  <Input type="number" step="1" value={caffeine} onChange={(e) => setCaffeine(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Mono. Fat (g)</Label>
                  <Input type="number" step="0.1" value={monoFat} onChange={(e) => setMonoFat(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#94a3b8] text-xs">Poly. Fat (g)</Label>
                  <Input type="number" step="0.1" value={polyFat} onChange={(e) => setPolyFat(e.target.value)} placeholder="0" className={inputClass} />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      )}

      {barcode && (
        <div className="space-y-1.5">
          <Label className="text-[#94a3b8]">Barcode</Label>
          <Input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className={inputClass}
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
  const [activeTab, setActiveTab] = useState('search')
  const [prefillFood, setPrefillFood] = useState<Food | null>(null)

  function handleFoodSelected(selected: Food) {
    setPrefillFood(selected)
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
          <TabsTrigger value="search" className="data-[state=active]:bg-[#1e293b] data-[state=active]:text-[#f8fafc]">
            Search
          </TabsTrigger>
          <TabsTrigger value="manual" className="data-[state=active]:bg-[#1e293b] data-[state=active]:text-[#f8fafc]">
            Manual
          </TabsTrigger>
        </TabsList>
        <TabsContent value="search" className="mt-4">
          <SearchSection onFoodSelected={handleFoodSelected} />
        </TabsContent>
        <TabsContent value="manual" className="mt-4">
          <ManualForm key={prefillFood?.id || 'new'} prefill={prefillFood} onSaved={onSaved} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
