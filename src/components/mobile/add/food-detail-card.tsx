'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Food } from '@/lib/types/food'

interface FoodDetailCardProps {
  food: Food
  onAdd: (food: Food, servings: number) => void
  onCancel: () => void
}

export function FoodDetailCard({ food, onAdd, onCancel }: FoodDetailCardProps) {
  const [servings, setServings] = useState(1)

  return (
    <div className="rounded-lg border border-[#1e293b] bg-[#0f172a] p-4">
      <h3 className="text-sm font-medium text-[#f8fafc]">
        {food.name} ({food.serving_size})
      </h3>
      {food.brand && <p className="mt-0.5 text-xs text-[#64748b]">{food.brand}</p>}

      <div className="mt-3 flex items-center justify-center gap-4">
        <button
          onClick={() => setServings(Math.max(0.5, servings - 0.5))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1e293b] text-[#f8fafc] hover:bg-[#1e293b]"
        >
          &minus;
        </button>
        <span className="min-w-[5rem] text-center text-sm font-medium text-[#f8fafc]">
          {servings} {servings === 1 ? 'serving' : 'servings'}
        </span>
        <button
          onClick={() => setServings(servings + 0.5)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1e293b] text-[#f8fafc] hover:bg-[#1e293b]"
        >
          +
        </button>
      </div>

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
