'use client'

import { useRecentFoods } from '@/hooks/use-recent-foods'
import { FoodListItem } from './food-list-item'
import { Clock } from 'lucide-react'
import { EmptyState } from '@/components/mobile/empty-state'
import type { Food } from '@/lib/types/food'

interface RecentTabProps {
  onSelectFood: (food: Food) => void
  onQuickAddFood: (food: Food) => void
}

export function RecentTab({ onSelectFood, onQuickAddFood }: RecentTabProps) {
  const { foods, isLoading } = useRecentFoods()

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
    return <EmptyState icon={<Clock size={40} />} message="Your recently logged foods will appear here" />
  }

  return (
    <div className="divide-y divide-[#1e293b]">
      {foods.map((food) => (
        <FoodListItem
          key={food.id}
          food={food}
          onSelect={onSelectFood}
          onQuickAdd={onQuickAddFood}
        />
      ))}
    </div>
  )
}
