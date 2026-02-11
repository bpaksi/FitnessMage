'use client'

import { Star } from 'lucide-react'
import type { Food } from '@/lib/types/food'

interface FoodListItemProps {
  food: Food
  isFavorite?: boolean
  onSelect: (food: Food) => void
  onQuickAdd?: (food: Food) => void
  onToggleFavorite?: (foodId: string, isFavorite: boolean) => void
}

export function FoodListItem({
  food,
  isFavorite = false,
  onSelect,
  onQuickAdd,
  onToggleFavorite,
}: FoodListItemProps) {
  const displayName = food.serving_size
    ? `${food.name} (${food.serving_size})`
    : food.name

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors active:bg-[#0f172a]"
      onClick={() => onSelect(food)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(food)
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        onQuickAdd?.(food)
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[#f8fafc]">{displayName}</p>
        <p className="text-xs text-[#64748b]">
          {Math.round(food.calories)} cal
          {food.brand && <span className="ml-1">&middot; {food.brand}</span>}
        </p>
      </div>
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(food.id, isFavorite)
          }}
          className="shrink-0 p-1"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star size={18} className={isFavorite ? 'fill-amber-400 text-amber-400' : 'text-[#64748b]'} />
        </button>
      )}
    </div>
  )
}
