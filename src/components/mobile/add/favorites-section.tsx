'use client'

import { useFavorites } from '@/hooks/use-favorites'
import { FoodListItem } from './food-list-item'
import type { Food } from '@/lib/types/food'

interface FavoritesSectionProps {
  onTapFood: (food: Food) => void
  onLongPressFood: (food: Food) => void
}

export function FavoritesSection({ onTapFood, onLongPressFood }: FavoritesSectionProps) {
  const { favorites, isLoading, toggleFavorite } = useFavorites()

  if (isLoading) {
    return (
      <div className="space-y-2 px-1 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-[#0f172a]" />
        ))}
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="py-8 text-center">
        <span className="mb-2 block text-2xl">⭐</span>
        <p className="text-sm text-[#64748b]">Star foods you eat often</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[#1e293b]">
      {favorites.map((food) => (
        <FoodListItem
          key={food.id}
          food={food}
          isFavorite={true}
          onTap={onTapFood}
          onLongPress={onLongPressFood}
          onToggleFavorite={toggleFavorite}
        />
      ))}
    </div>
  )
}
