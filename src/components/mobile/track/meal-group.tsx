'use client'

import { useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { DailyLogEntry, MealType } from '@/lib/types/log'

const MEAL_ICONS: Record<MealType, string> = {
  breakfast: '☀️',
  lunch: '🌤️',
  dinner: '🌙',
  snack: '🍎',
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
}

interface MealGroupProps {
  mealType: MealType
  entries: DailyLogEntry[]
  children: React.ReactNode
  onCopyMeal?: () => void
}

export function MealGroup({ mealType, entries, children, onCopyMeal }: MealGroupProps) {
  const [open, setOpen] = useState(true)

  const totalCals = entries.reduce((sum, e) => sum + Number(e.calories), 0)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-[#0f172a]">
        <div className="flex items-center gap-2">
          <span>{MEAL_ICONS[mealType]}</span>
          <span className="text-sm font-medium text-[#f8fafc]">{MEAL_LABELS[mealType]}</span>
          <span className="text-xs text-[#64748b]">
            {entries.length > 0 ? `${Math.round(totalCals)} cal` : ''}
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`text-[#64748b] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {entries.length === 0 ? (
          <div className="flex items-center justify-between px-3 py-4">
            <p className="text-xs text-[#475569]">Nothing logged for {MEAL_LABELS[mealType]}</p>
            {onCopyMeal && (
              <button
                onClick={onCopyMeal}
                className="text-xs text-[#3b82f6] hover:text-[#60a5fa]"
              >
                Copy from...
              </button>
            )}
          </div>
        ) : (
          <div>
            {children}
            {onCopyMeal && (
              <button
                onClick={onCopyMeal}
                className="mt-1 block w-full px-3 py-2 text-left text-xs text-[#3b82f6] hover:text-[#60a5fa]"
              >
                Copy from...
              </button>
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
