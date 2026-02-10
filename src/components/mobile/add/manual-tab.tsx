'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ManualFoodValues {
  name: string
  brand?: string
  serving_size: string
  calories: number
  protein: number
  carbs: number
  fat: number
  barcode?: string
}

interface ManualTabProps {
  initialBarcode?: string
  onSubmit: (values: ManualFoodValues) => void
  loading?: boolean
}

export function ManualTab({ initialBarcode, onSubmit, loading }: ManualTabProps) {
  const {
    register,
    handleSubmit,
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
        <Input {...register('serving_size')} placeholder="e.g., 1 cup, 100g" className={inputClass} />
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
