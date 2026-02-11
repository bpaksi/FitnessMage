'use client'

import { useState } from 'react'
import { useFoodSearch } from '@/hooks/use-food-search'
import { useFavorites } from '@/hooks/use-favorites'
import { FoodListItem } from './food-list-item'
import { Input } from '@/components/ui/input'
import type { Food } from '@/lib/types/food'

interface SearchTabProps {
  onSelectFood: (food: Food) => void
  onQuickAddFood: (food: Food) => void
}

export function SearchTab({ onSelectFood, onQuickAddFood }: SearchTabProps) {
  const [query, setQuery] = useState('')
  const { foods, isLoading } = useFoodSearch(query)
  const { favorites, toggleFavorite } = useFavorites()
  const favoriteIds = new Set(favorites.map((f) => f.id))

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search foods..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
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
        {foods.map((food) => (
          <FoodListItem
            key={food.id}
            food={food}
            isFavorite={favoriteIds.has(food.id)}
            onSelect={onSelectFood}
            onQuickAdd={onQuickAddFood}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </div>
  )
}
