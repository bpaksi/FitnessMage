'use client'

import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { AmountInput, getAmountLabel } from '@/components/mobile/amount-input'
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
          <AmountInput
            servingSize={food.serving_size}
            servings={servings}
            onServingsChange={setServings}
          />

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
            Add {getAmountLabel(food.serving_size, servings)}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
