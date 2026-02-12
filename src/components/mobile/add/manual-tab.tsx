'use client'

import { useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { ChevronDown, Pill } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ServingSizeInput } from './serving-size-input'

interface ManualFoodValues {
  name: string
  brand?: string
  serving_size: string
  calories: number
  protein: number
  carbs: number
  fat: number
  barcode?: string
  category?: 'food' | 'supplement'
  // Standard nutrition label
  fiber?: number
  sugar?: number
  sodium?: number
  saturated_fat?: number
  trans_fat?: number
  cholesterol?: number
  potassium?: number
  // Vitamins
  vitamin_d?: number
  vitamin_a?: number
  vitamin_c?: number
  vitamin_e?: number
  vitamin_k?: number
  vitamin_b12?: number
  vitamin_b6?: number
  thiamin?: number
  riboflavin?: number
  niacin?: number
  folate?: number
  choline?: number
  // Minerals
  calcium?: number
  iron?: number
  magnesium?: number
  zinc?: number
  phosphorus?: number
  copper?: number
  selenium?: number
  manganese?: number
  // Other
  monounsaturated_fat?: number
  polyunsaturated_fat?: number
  caffeine?: number
}

interface ManualTabProps {
  initialBarcode?: string
  onSubmit: (values: ManualFoodValues) => void
  loading?: boolean
}

export function ManualTab({ initialBarcode, onSubmit, loading }: ManualTabProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [extendedOpen, setExtendedOpen] = useState(false)
  const [category, setCategory] = useState<'food' | 'supplement'>('food')
  const moreRef = useRef<HTMLDivElement>(null)
  const extendedRef = useRef<HTMLDivElement>(null)
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ManualFoodValues>({
    defaultValues: {
      barcode: initialBarcode || '',
      serving_size: '1 serving',
      category: 'food',
    },
  })

  function onValid(values: ManualFoodValues) {
    onSubmit(values)
  }

  const inputClass = 'border-[#1e293b] bg-[#020817] text-[#f8fafc]'
  const errorClass = 'text-xs text-red-400 mt-1'
  const isSupplement = category === 'supplement'

  function NutrientInput({ label, name, step = '0.1' }: { label: string; name: keyof ManualFoodValues; step?: string }) {
    return (
      <div className="space-y-1.5">
        <Label className="text-[#94a3b8] text-xs">{label}</Label>
        <Input type="number" step={step} {...register(name, { valueAsNumber: true })} placeholder="0" className={inputClass} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-4">
      <div className="flex gap-1 rounded-lg border border-[#1e293b] bg-[#0f172a] p-1">
        <button
          type="button"
          onClick={() => {
            setCategory('food')
            setValue('category', 'food')
            navigator.vibrate?.(50)
          }}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
            category === 'food'
              ? 'bg-[#3b82f6] text-white shadow-sm'
              : 'text-[#64748b]'
          }`}
        >
          Food
        </button>
        <button
          type="button"
          onClick={() => {
            setCategory('supplement')
            setValue('category', 'supplement')
            setValue('serving_size', '1 capsule')
            navigator.vibrate?.(50)
          }}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
            category === 'supplement'
              ? 'bg-[#a78bfa] text-white shadow-sm'
              : 'text-[#64748b]'
          }`}
        >
          <Pill size={14} className="mr-1 inline" />
          Supplement
        </button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[#94a3b8]">Name</Label>
        <Input {...register('name')} placeholder={isSupplement ? 'e.g., Daily Multivitamin' : 'e.g., My Smoothie'} className={inputClass} />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[#94a3b8]">Brand (optional)</Label>
        <Input {...register('brand')} placeholder={isSupplement ? 'e.g., Nature Made' : 'e.g., Homemade'} className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[#94a3b8]">Serving Size</Label>
        <Controller
          control={control}
          name="serving_size"
          render={({ field }) => (
            <ServingSizeInput value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.serving_size && <p className={errorClass}>{errors.serving_size.message}</p>}
      </div>

      {/* Primary fields: macros for food, vitamins/minerals for supplements */}
      {isSupplement ? (
        <div className="grid grid-cols-2 gap-3">
          <NutrientInput label="Vitamin D (mcg)" name="vitamin_d" />
          <NutrientInput label="Vitamin C (mg)" name="vitamin_c" />
          <NutrientInput label="Vitamin B12 (mcg)" name="vitamin_b12" step="0.01" />
          <NutrientInput label="Calcium (mg)" name="calcium" step="1" />
          <NutrientInput label="Iron (mg)" name="iron" />
          <NutrientInput label="Magnesium (mg)" name="magnesium" step="1" />
          <NutrientInput label="Zinc (mg)" name="zinc" />
          <NutrientInput label="Folate (mcg)" name="folate" step="1" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[#94a3b8]">Calories</Label>
            <Input type="number" {...register('calories', { valueAsNumber: true })} placeholder="0" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[#94a3b8]">Protein (g)</Label>
            <Input type="number" step="0.1" {...register('protein', { valueAsNumber: true })} placeholder="0" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[#94a3b8]">Carbs (g)</Label>
            <Input type="number" step="0.1" {...register('carbs', { valueAsNumber: true })} placeholder="0" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[#94a3b8]">Fat (g)</Label>
            <Input type="number" step="0.1" {...register('fat', { valueAsNumber: true })} placeholder="0" className={inputClass} />
          </div>
        </div>
      )}

      {isSupplement ? (
        <>
          {/* Supplement: single "More" with remaining vitamins/minerals + macros */}
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
                <NutrientInput label="Vitamin A (mcg)" name="vitamin_a" />
                <NutrientInput label="Vitamin E (mg)" name="vitamin_e" />
                <NutrientInput label="Vitamin K (mcg)" name="vitamin_k" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="Thiamin (mg)" name="thiamin" step="0.01" />
                <NutrientInput label="Riboflavin (mg)" name="riboflavin" step="0.01" />
                <NutrientInput label="Niacin (mg)" name="niacin" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="B6 (mg)" name="vitamin_b6" step="0.01" />
                <NutrientInput label="Choline (mg)" name="choline" step="1" />
                <NutrientInput label="Potassium (mg)" name="potassium" step="1" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="Selenium (mcg)" name="selenium" />
                <NutrientInput label="Copper (mg)" name="copper" step="0.01" />
                <NutrientInput label="Phosphorus (mg)" name="phosphorus" step="1" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="Manganese (mg)" name="manganese" step="0.01" />
                <NutrientInput label="Sodium (mg)" name="sodium" step="1" />
                <div />
              </div>
            </CollapsibleContent>
          </Collapsible>

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
                <NutrientInput label="Calories" name="calories" step="1" />
                <NutrientInput label="Protein (g)" name="protein" />
                <NutrientInput label="Carbs (g)" name="carbs" />
                <NutrientInput label="Fat (g)" name="fat" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="Fiber (g)" name="fiber" />
                <NutrientInput label="Sugar (g)" name="sugar" />
                <NutrientInput label="Cholesterol (mg)" name="cholesterol" step="1" />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      ) : (
        <>
          {/* Food: "More Nutrition" = standard label, "Extended" = deep vitamins/minerals */}
          <Collapsible open={moreOpen} onOpenChange={(open) => {
            setMoreOpen(open)
            if (open) {
              setTimeout(() => moreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
            }
          }}>
            <CollapsibleTrigger className="flex w-full items-center gap-2 py-2 text-sm text-[#94a3b8] transition-colors hover:text-[#f8fafc]">
              <ChevronDown size={16} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              More Nutrition
            </CollapsibleTrigger>
            <CollapsibleContent ref={moreRef} className="space-y-3 pt-2">
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="Fiber (g)" name="fiber" />
                <NutrientInput label="Sugar (g)" name="sugar" />
                <NutrientInput label="Sodium (mg)" name="sodium" step="1" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="Sat. Fat (g)" name="saturated_fat" />
                <NutrientInput label="Trans Fat (g)" name="trans_fat" />
                <NutrientInput label="Cholesterol (mg)" name="cholesterol" step="1" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="Potassium (mg)" name="potassium" step="1" />
                <NutrientInput label="Vitamin D (mcg)" name="vitamin_d" />
                <NutrientInput label="Calcium (mg)" name="calcium" step="1" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="Iron (mg)" name="iron" />
                <div />
                <div />
              </div>
            </CollapsibleContent>
          </Collapsible>

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
                <NutrientInput label="Vitamin A (mcg)" name="vitamin_a" />
                <NutrientInput label="Vitamin C (mg)" name="vitamin_c" />
                <NutrientInput label="Vitamin E (mg)" name="vitamin_e" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="Vitamin K (mcg)" name="vitamin_k" />
                <NutrientInput label="Thiamin (mg)" name="thiamin" step="0.01" />
                <NutrientInput label="Riboflavin (mg)" name="riboflavin" step="0.01" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="Niacin (mg)" name="niacin" />
                <NutrientInput label="B6 (mg)" name="vitamin_b6" step="0.01" />
                <NutrientInput label="B12 (mcg)" name="vitamin_b12" step="0.01" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="Folate (mcg)" name="folate" step="1" />
                <NutrientInput label="Choline (mg)" name="choline" step="1" />
                <div />
              </div>

              <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Minerals</p>
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="Magnesium (mg)" name="magnesium" step="1" />
                <NutrientInput label="Zinc (mg)" name="zinc" />
                <NutrientInput label="Selenium (mcg)" name="selenium" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="Copper (mg)" name="copper" step="0.01" />
                <NutrientInput label="Phosphorus (mg)" name="phosphorus" step="1" />
                <NutrientInput label="Manganese (mg)" name="manganese" step="0.01" />
              </div>

              <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Other</p>
              <div className="grid grid-cols-3 gap-3">
                <NutrientInput label="Caffeine (mg)" name="caffeine" step="1" />
                <NutrientInput label="Mono. Fat (g)" name="monounsaturated_fat" />
                <NutrientInput label="Poly. Fat (g)" name="polyunsaturated_fat" />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      )}

      {initialBarcode && (
        <div className="space-y-1.5">
          <Label className="text-[#94a3b8]">Barcode</Label>
          <Input {...register('barcode')} readOnly className={`${inputClass} opacity-60`} />
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#3b82f6] text-white hover:bg-[#2563eb]"
      >
        {loading ? 'Creating...' : 'Create & Log'}
      </Button>
    </form>
  )
}
