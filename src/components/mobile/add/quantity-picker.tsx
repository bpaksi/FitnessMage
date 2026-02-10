'use client'

import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import type { Food } from '@/lib/types/food'

interface QuantityPickerProps {
  food: Food | null
  open: boolean
  onClose: () => void
  onConfirm: (food: Food, servings: number) => void
}

export function QuantityPicker({ food, open, onClose, onConfirm }: QuantityPickerProps) {
  const [servings, setServings] = useState(1)

  if (!food) return null

  const previewCalories = Math.round(food.calories * servings)
  const previewProtein = Math.round(food.protein * servings * 10) / 10
  const previewCarbs = Math.round(food.carbs * servings * 10) / 10
  const previewFat = Math.round(food.fat * servings * 10) / 10

  function adjust(delta: number) {
    setServings((s) => Math.max(0.25, Math.round((s + delta) * 4) / 4))
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="border-[#1e293b] bg-[#0f172a]">
        <DrawerHeader>
          <DrawerTitle className="text-[#f8fafc]">
            {food.name} {food.serving_size && `(${food.serving_size})`}
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8">
          {/* Quantity control */}
          <div className="flex items-center justify-center gap-6 py-4">
            <button
              onClick={() => adjust(-0.25)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e293b] text-lg text-[#94a3b8]"
            >
              -
            </button>
            <span className="min-w-[60px] text-center text-2xl font-light tabular-nums text-[#f8fafc]">
              {servings}
            </span>
            <button
              onClick={() => adjust(0.25)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e293b] text-lg text-[#94a3b8]"
            >
              +
            </button>
          </div>

          {/* Live preview */}
          <div className="mb-6 grid grid-cols-4 gap-2 rounded-lg bg-[#020817] p-3">
            <div className="text-center">
              <p className="text-xs text-[#64748b]">Cal</p>
              <p className="text-sm font-medium text-[#22c55e]">{previewCalories}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#64748b]">Protein</p>
              <p className="text-sm font-medium text-[#ef4444]">{previewProtein}g</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#64748b]">Carbs</p>
              <p className="text-sm font-medium text-[#3b82f6]">{previewCarbs}g</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#64748b]">Fat</p>
              <p className="text-sm font-medium text-[#eab308]">{previewFat}g</p>
            </div>
          </div>

          <Button
            onClick={() => {
              onConfirm(food, servings)
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
