'use client'

import { Button } from '@/components/ui/button'
import type { Food } from '@/lib/types/food'

interface FoodDetailCardProps {
  food: Food
  onAdd: (food: Food) => void
}

export function FoodDetailCard({ food, onAdd }: FoodDetailCardProps) {
  return (
    <div className="rounded-lg border border-[#1e293b] bg-[#0f172a] p-4">
      <h3 className="text-sm font-medium text-[#f8fafc]">
        {food.name} {food.serving_size && `(${food.serving_size})`}
      </h3>
      {food.brand && <p className="mt-0.5 text-xs text-[#64748b]">{food.brand}</p>}

      <div className="mt-3 grid grid-cols-4 gap-2">
        <div className="text-center">
          <p className="text-xs text-[#64748b]">Cal</p>
          <p className="text-sm font-medium text-[#22c55e]">{Math.round(food.calories)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[#64748b]">Protein</p>
          <p className="text-sm font-medium text-[#ef4444]">{food.protein}g</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[#64748b]">Carbs</p>
          <p className="text-sm font-medium text-[#3b82f6]">{food.carbs}g</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[#64748b]">Fat</p>
          <p className="text-sm font-medium text-[#eab308]">{food.fat}g</p>
        </div>
      </div>

      <Button
        onClick={() => onAdd(food)}
        className="mt-4 w-full bg-[#3b82f6] text-white hover:bg-[#2563eb]"
      >
        Add to Log
      </Button>
    </div>
  )
}
