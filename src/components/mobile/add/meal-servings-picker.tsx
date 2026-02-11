'use client'

import { useState, useEffect } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import type { Meal } from '@/lib/types/meal'

interface MealServingsPickerProps {
  meal: Meal | null
  open: boolean
  onClose: () => void
  onConfirm: (meal: Meal, servings: number) => void
}

export function MealServingsPicker({ meal, open, onClose, onConfirm }: MealServingsPickerProps) {
  const [servings, setServings] = useState(1)

  useEffect(() => {
    if (open) setServings(1)
  }, [open])

  if (!meal) return null

  const ts = meal.total_servings || 1

  // Calculate total meal macros
  const mealTotals = meal.foods.reduce(
    (acc, mf) => ({
      calories: acc.calories + mf.food.calories * mf.servings,
      protein: acc.protein + mf.food.protein * mf.servings,
      carbs: acc.carbs + mf.food.carbs * mf.servings,
      fat: acc.fat + mf.food.fat * mf.servings,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  // Per-serving macros * selected servings
  const preview = {
    calories: Math.round((mealTotals.calories / ts) * servings),
    protein: Math.round((mealTotals.protein / ts) * servings * 10) / 10,
    carbs: Math.round((mealTotals.carbs / ts) * servings * 10) / 10,
    fat: Math.round((mealTotals.fat / ts) * servings * 10) / 10,
  }

  function adjust(delta: number) {
    setServings((s) => {
      const next = Math.round((s + delta) * 2) / 2 // 0.5 increments
      return Math.max(0.5, Math.min(ts, next))
    })
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="border-[#1e293b] bg-[#0f172a]">
        <DrawerHeader>
          <DrawerTitle className="text-[#f8fafc]">{meal.name}</DrawerTitle>
          {ts > 1 && (
            <p className="text-xs text-[#64748b]">Makes {ts} servings</p>
          )}
        </DrawerHeader>
        <div className="px-4 pb-8">
          {/* Servings control */}
          <div className="flex items-center justify-center gap-6 py-4">
            <button
              onClick={() => adjust(-0.5)}
              disabled={servings <= 0.5}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e293b] text-lg text-[#94a3b8] disabled:opacity-30"
            >
              -
            </button>
            <span className="min-w-[60px] text-center text-2xl font-light tabular-nums text-[#f8fafc]">
              {servings}
            </span>
            <button
              onClick={() => adjust(0.5)}
              disabled={servings >= ts}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e293b] text-lg text-[#94a3b8] disabled:opacity-30"
            >
              +
            </button>
          </div>

          {/* Live preview */}
          <div className="mb-6 grid grid-cols-4 gap-2 rounded-lg bg-[#020817] p-3">
            <div className="text-center">
              <p className="text-xs text-[#64748b]">Cal</p>
              <p className="text-sm font-medium text-[#22c55e]">{preview.calories}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#64748b]">Protein</p>
              <p className="text-sm font-medium text-[#ef4444]">{preview.protein}g</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#64748b]">Carbs</p>
              <p className="text-sm font-medium text-[#3b82f6]">{preview.carbs}g</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#64748b]">Fat</p>
              <p className="text-sm font-medium text-[#eab308]">{preview.fat}g</p>
            </div>
          </div>

          <Button
            onClick={() => {
              onConfirm(meal, servings)
              setServings(1)
            }}
            className="w-full bg-[#3b82f6] text-white hover:bg-[#2563eb]"
          >
            Add {servings} serving{servings !== 1 ? 's' : ''}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
