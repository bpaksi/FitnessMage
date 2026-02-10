'use client'

import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { DailyLogEntry, MealType } from '@/lib/types/log'

interface EditEntrySheetProps {
  entry: DailyLogEntry | null
  open: boolean
  onClose: () => void
  onSave: (id: string, servings: number, mealType: MealType) => void
}

export function EditEntrySheet({ entry, open, onClose, onSave }: EditEntrySheetProps) {
  const [servings, setServings] = useState(entry?.servings ?? 1)
  const [mealType, setMealType] = useState<MealType>(entry?.meal_type ?? 'snack')
  const [prevEntry, setPrevEntry] = useState(entry)

  if (entry !== prevEntry) {
    setPrevEntry(entry)
    if (entry) {
      setServings(entry.servings)
      setMealType(entry.meal_type)
    }
  }

  if (!entry) return null

  const baseCalories = entry.food ? Number(entry.calories) / entry.servings : 0
  const previewCals = Math.round(baseCalories * servings)

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="border-[#1e293b] bg-[#0f172a]">
        <DrawerHeader>
          <DrawerTitle className="text-[#f8fafc]">Edit Entry</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 px-4 pb-8">
          {/* Servings */}
          <div className="flex items-center justify-center gap-6 py-2">
            <button
              onClick={() => setServings((s) => Math.max(0.25, Math.round((s - 0.25) * 4) / 4))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e293b] text-lg text-[#94a3b8]"
            >
              -
            </button>
            <span className="min-w-[60px] text-center text-2xl font-light tabular-nums text-[#f8fafc]">
              {servings}
            </span>
            <button
              onClick={() => setServings((s) => Math.round((s + 0.25) * 4) / 4)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e293b] text-lg text-[#94a3b8]"
            >
              +
            </button>
          </div>

          <p className="text-center text-sm text-[#64748b]">{previewCals} cal</p>

          {/* Meal type */}
          <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
            <SelectTrigger className="border-[#1e293b] bg-[#020817] text-[#f8fafc]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[#1e293b] bg-[#0f172a]">
              <SelectItem value="breakfast" className="text-[#f8fafc]">Breakfast</SelectItem>
              <SelectItem value="lunch" className="text-[#f8fafc]">Lunch</SelectItem>
              <SelectItem value="dinner" className="text-[#f8fafc]">Dinner</SelectItem>
              <SelectItem value="snack" className="text-[#f8fafc]">Snack</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => onSave(entry.id, servings, mealType)}
            className="w-full bg-[#3b82f6] text-white hover:bg-[#2563eb]"
          >
            Save Changes
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
