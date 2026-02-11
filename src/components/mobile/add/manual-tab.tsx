'use client'

import { useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { ChevronDown } from 'lucide-react'
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
  fiber?: number
  sugar?: number
  sodium?: number
  saturated_fat?: number
  trans_fat?: number
  cholesterol?: number
  potassium?: number
  vitamin_d?: number
  calcium?: number
  iron?: number
}

interface ManualTabProps {
  initialBarcode?: string
  onSubmit: (values: ManualFoodValues) => void
  loading?: boolean
}

export function ManualTab({ initialBarcode, onSubmit, loading }: ManualTabProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ManualFoodValues>({
    defaultValues: {
      barcode: initialBarcode || '',
      serving_size: '1 serving',
    },
  })

  function onValid(values: ManualFoodValues) {
    onSubmit(values)
  }

  const inputClass = 'border-[#1e293b] bg-[#020817] text-[#f8fafc]'
  const errorClass = 'text-xs text-red-400 mt-1'

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-[#94a3b8]">Name</Label>
        <Input {...register('name')} placeholder="e.g., My Smoothie" className={inputClass} />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[#94a3b8]">Brand (optional)</Label>
        <Input {...register('brand')} placeholder="e.g., Homemade" className={inputClass} />
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[#94a3b8]">Calories</Label>
          <Input type="number" {...register('calories')} placeholder="0" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[#94a3b8]">Protein (g)</Label>
          <Input type="number" step="0.1" {...register('protein')} placeholder="0" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[#94a3b8]">Carbs (g)</Label>
          <Input type="number" step="0.1" {...register('carbs')} placeholder="0" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[#94a3b8]">Fat (g)</Label>
          <Input type="number" step="0.1" {...register('fat')} placeholder="0" className={inputClass} />
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
              <Input type="number" step="0.1" {...register('fiber', { valueAsNumber: true })} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Sugar (g)</Label>
              <Input type="number" step="0.1" {...register('sugar', { valueAsNumber: true })} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Sodium (mg)</Label>
              <Input type="number" step="1" {...register('sodium', { valueAsNumber: true })} placeholder="0" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Sat. Fat (g)</Label>
              <Input type="number" step="0.1" {...register('saturated_fat', { valueAsNumber: true })} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Trans Fat (g)</Label>
              <Input type="number" step="0.1" {...register('trans_fat', { valueAsNumber: true })} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Cholesterol (mg)</Label>
              <Input type="number" step="1" {...register('cholesterol', { valueAsNumber: true })} placeholder="0" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Potassium (mg)</Label>
              <Input type="number" step="1" {...register('potassium', { valueAsNumber: true })} placeholder="0" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Vitamin D (mcg)</Label>
              <Input type="number" step="0.1" {...register('vitamin_d', { valueAsNumber: true })} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Calcium (mg)</Label>
              <Input type="number" step="1" {...register('calcium', { valueAsNumber: true })} placeholder="0" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8] text-xs">Iron (mg)</Label>
              <Input type="number" step="0.1" {...register('iron', { valueAsNumber: true })} placeholder="0" className={inputClass} />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

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
