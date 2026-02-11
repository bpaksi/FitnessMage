'use client'

import type { Food } from '@/lib/types/food'

interface FoodListItemProps {
  food: Food
  isFavorite?: boolean
  onTap: (food: Food) => void
  onLongPress?: (food: Food) => void
  onToggleFavorite?: (foodId: string, isFavorite: boolean) => void
}

export function FoodListItem({
  food,
  isFavorite = false,
  onTap,
  onLongPress,
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
      onClick={() => onTap(food)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onTap(food)
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        onLongPress?.(food)
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
          className="shrink-0 p-1 text-lg"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      )}
    </div>
  )
}
