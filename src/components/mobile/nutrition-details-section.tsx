'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { MacroProgressBar } from '@/components/mobile/macro-progress-bar'
import type { ExtendedNutrientSummary } from '@/lib/types/log'
import { EXTENDED_NUTRIENT_KEYS } from '@/lib/constants/daily-values'

const STORAGE_KEY = 'fm-nutrition-details-expanded'

interface NutritionDetailsSectionProps {
  extendedNutrients: Record<string, ExtendedNutrientSummary>
}

export function NutritionDetailsSection({ extendedNutrients }: NutritionDetailsSectionProps) {
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  function toggle() {
    setExpanded((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  const hasAnyData = EXTENDED_NUTRIENT_KEYS.some(
    (key) => extendedNutrients[key]?.total > 0,
  )

  if (!hasAnyData) return null

  return (
    <section className="mt-6" aria-label="Extended nutrition details">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between py-2 text-xs font-medium uppercase tracking-wider text-[#64748b] transition-colors hover:text-[#94a3b8]"
        aria-expanded={expanded}
      >
        <span>More Nutrition</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="space-y-4 pt-2">
          {EXTENDED_NUTRIENT_KEYS.map((key) => {
            const nutrient = extendedNutrients[key]
            if (!nutrient) return null
            return (
              <MacroProgressBar
                key={key}
                label={nutrient.label}
                current={nutrient.total}
                goal={nutrient.dailyValue}
                color={nutrient.color}
                unit={nutrient.unit}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
