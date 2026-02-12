'use client'

import { useState, useRef, useEffect } from 'react'
import { useFoodSearch } from '@/hooks/use-food-search'
import { FoodListItem } from './food-list-item'
import { Input } from '@/components/ui/input'
import type { Food } from '@/lib/types/food'

interface SearchTabProps {
  active?: boolean
  onSelectFood: (food: Food) => void
  onQuickAddFood: (food: Food) => void
}

export function SearchTab({ active, onSelectFood, onQuickAddFood }: SearchTabProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (active) {
      // Small delay to ensure the tab content is visible before focusing
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [active])
  const { foods, isLoading } = useFoodSearch(query)

  return (
    <div className="space-y-3">
      <Input
        ref={inputRef}
        placeholder="Search foods..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border-[#1e293b] bg-[#0f172a] text-[#f8fafc] placeholder:text-[#475569]"
      />

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-[#0f172a]" />
          ))}
        </div>
      )}

      {!isLoading && query.length >= 2 && foods.length === 0 && (
        <p className="py-6 text-center text-sm text-[#64748b]">
          No results for &ldquo;{query}&rdquo;
        </p>
      )}

      <div className="divide-y divide-[#1e293b]">
        {foods.map((food, i) => (
          <FoodListItem
            key={food.id || `search-${i}`}
            food={food}
            onSelect={onSelectFood}
            onQuickAdd={onQuickAddFood}
          />
        ))}
      </div>
    </div>
  )
}
