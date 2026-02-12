'use client'

import { Sun, CloudSun, Moon, Apple } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import type { DailyLogEntry, MealType } from '@/lib/types/log'

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

const MEAL_ICONS: Record<MealType, React.ReactNode> = {
  breakfast: <Sun size={18} className="text-amber-400" />,
  lunch: <CloudSun size={18} className="text-sky-400" />,
  dinner: <Moon size={18} className="text-indigo-400" />,
  snack: <Apple size={18} className="text-emerald-400" />,
}

interface MoveMealSheetProps {
  entry: DailyLogEntry | null
  open: boolean
  onClose: () => void
  onMove: (id: string, targetMealType: MealType) => void
}

export function MoveMealSheet({ entry, open, onClose, onMove }: MoveMealSheetProps) {
  if (!entry) return null

  const foodName = entry.meal
    ? entry.meal.name
    : entry.food
      ? `${entry.food.name}${entry.food.serving_size ? ` (${entry.food.serving_size})` : ''}`
      : 'this entry'

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="border-[#1e293b] bg-[#0f172a]">
        <DrawerHeader>
          <DrawerTitle className="text-[#f8fafc]">Move to...</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-2 px-4 pb-8">
          <p className="pb-1 text-xs text-[#64748b]">
            Move {foodName} to another meal
          </p>
          {MEAL_ORDER.filter((m) => m !== entry.meal_type).map((meal) => (
            <button
              key={meal}
              onClick={() => onMove(entry.id, meal)}
              className="flex w-full items-center gap-3 rounded-lg bg-[#020817] px-4 py-3 text-left transition-colors active:bg-[#1e293b]"
            >
              {MEAL_ICONS[meal]}
              <span className="text-sm text-[#f8fafc]">{MEAL_LABELS[meal]}</span>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
