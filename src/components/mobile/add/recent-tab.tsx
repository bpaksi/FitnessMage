'use client'

import { useRecentFoods } from '@/hooks/use-recent-foods'
import { useFavorites } from '@/hooks/use-favorites'
import { FoodListItem } from './food-list-item'
import { EmptyState } from '@/components/mobile/empty-state'
import type { Food } from '@/lib/types/food'

interface RecentTabProps {
  onTapFood: (food: Food) => void
  onLongPressFood: (food: Food) => void
}

export function RecentTab({ onTapFood, onLongPressFood }: RecentTabProps) {
  const { foods, isLoading } = useRecentFoods()
  const { favorites, toggleFavorite } = useFavorites()
  const favoriteIds = new Set(favorites.map((f) => f.id))

  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-[#0f172a]" />
        ))}
      </div>
    )
  }

  if (foods.length === 0) {
    return <EmptyState icon="🕐" message="Your recently logged foods will appear here" />
  }

  return (
    <div className="divide-y divide-[#1e293b]">
      {foods.map((food) => (
        <FoodListItem
          key={food.id}
          food={food}
          isFavorite={favoriteIds.has(food.id)}
          onTap={onTapFood}
          onLongPress={onLongPressFood}
          onToggleFavorite={toggleFavorite}
        />
      ))}
    </div>
  )
}
