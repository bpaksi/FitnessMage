'use client'

import { useState } from 'react'
import { Pill } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AmountInput } from '@/components/mobile/amount-input'
import type { Food } from '@/lib/types/food'

interface FoodDetailCardProps {
  food: Food
  onAdd: (food: Food, servings: number) => void
  onCancel: () => void
}

const SUPPLEMENT_NUTRIENTS = [
  { key: 'vitamin_d', label: 'Vitamin D', unit: 'mcg' },
  { key: 'vitamin_c', label: 'Vitamin C', unit: 'mg' },
  { key: 'vitamin_b12', label: 'B12', unit: 'mcg' },
  { key: 'calcium', label: 'Calcium', unit: 'mg' },
  { key: 'iron', label: 'Iron', unit: 'mg' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
  { key: 'zinc', label: 'Zinc', unit: 'mg' },
  { key: 'folate', label: 'Folate', unit: 'mcg' },
] as const

export function FoodDetailCard({ food, onAdd, onCancel }: FoodDetailCardProps) {
  const [servings, setServings] = useState(1)
  const isSupplement = food.category === 'supplement'

  const visibleNutrients = isSupplement
    ? SUPPLEMENT_NUTRIENTS.filter((n) => food[n.key] != null && food[n.key]! > 0)
    : []

  return (
    <div className="rounded-lg border border-[#1e293b] bg-[#0f172a] p-4">
      {/* Name + supplement badge */}
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-[#f8fafc]">{food.name}</h3>
          {food.brand && <p className="mt-0.5 text-xs text-[#64748b]">{food.brand}</p>}
          {food.barcode && (
            <p className="mt-0.5 text-xs text-[#64748b] tabular-nums">{food.barcode}</p>
          )}
        </div>
        {isSupplement && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#a78bfa]/15 px-2 py-0.5 text-xs font-medium text-[#a78bfa]">
            <Pill size={12} />
            Supplement
          </span>
        )}
      </div>

      {/* Serving size callout */}
      <div className="mt-3 rounded-md bg-[#020817] px-3 py-2 text-center">
        <p className="text-xs text-[#64748b]">Serving size</p>
        <p className="text-sm font-medium text-[#f8fafc]">{food.serving_size || '1 serving'}</p>
      </div>

      {/* Amount input */}
      <div className="mt-3">
        <AmountInput
          servingSize={food.serving_size}
          servings={servings}
          onServingsChange={setServings}
        />
      </div>

      {/* Nutrient grid — macros for food, vitamins for supplements */}
      {isSupplement ? (
        visibleNutrients.length > 0 ? (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {visibleNutrients.map((n) => (
              <div key={n.key} className="text-center">
                <p className="text-xs text-[#64748b]">{n.label}</p>
                <p className="text-sm font-medium text-[#a78bfa]">
                  {Math.round(food[n.key]! * servings)}
                  <span className="text-xs font-normal text-[#64748b]"> {n.unit}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-center text-xs text-[#64748b]">No nutrient data available</p>
        )
      ) : (
        <div className="mt-3 grid grid-cols-4 gap-2">
          <div className="text-center">
            <p className="text-xs text-[#64748b]">Cal</p>
            <p className="text-sm font-medium text-[#22c55e]">{Math.round(food.calories * servings)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#64748b]">Protein</p>
            <p className="text-sm font-medium text-[#ef4444]">{Math.round(food.protein * servings)}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#64748b]">Carbs</p>
            <p className="text-sm font-medium text-[#3b82f6]">{Math.round(food.carbs * servings)}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#64748b]">Fat</p>
            <p className="text-sm font-medium text-[#eab308]">{Math.round(food.fat * servings)}g</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-[#1e293b] text-[#94a3b8]"
        >
          Wrong item
        </Button>
        <Button
          onClick={() => onAdd(food, servings)}
          className="flex-1 bg-[#3b82f6] text-white hover:bg-[#2563eb]"
        >
          Add to Log
        </Button>
      </div>
    </div>
  )
}
