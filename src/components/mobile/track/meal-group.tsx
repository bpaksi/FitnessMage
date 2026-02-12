'use client'

import { useState } from 'react'
import { Sun, CloudSun, Moon, Apple } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { DailyLogEntry, MealType } from '@/lib/types/log'

const MEAL_ICONS: Record<MealType, React.ReactNode> = {
  breakfast: <Sun size={16} className="text-amber-400" />,
  lunch: <CloudSun size={16} className="text-sky-400" />,
  dinner: <Moon size={16} className="text-indigo-400" />,
  snack: <Apple size={16} className="text-emerald-400" />,
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
}

export function MealGroup({ mealType, entries, children }: MealGroupProps) {
  const [open, setOpen] = useState(entries.length > 0)

  const totalCals = entries.reduce((sum, e) => sum + Number(e.calories), 0)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-[#0f172a] px-3 py-2.5 transition-colors hover:bg-[#162033]">
        <div className="flex items-center gap-2">
          <span>{MEAL_ICONS[mealType]}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">{MEAL_LABELS[mealType]}</span>
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
          <p className="px-3 py-4 text-xs text-[#475569]">Nothing logged for {MEAL_LABELS[mealType]}</p>
        ) : (
          <div>{children}</div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
