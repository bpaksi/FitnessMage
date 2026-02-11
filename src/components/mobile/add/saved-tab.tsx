'use client'

import { Star, UtensilsCrossed } from 'lucide-react'
import { useFavorites } from '@/hooks/use-favorites'
import { useMeals } from '@/hooks/use-meals'
import { FoodListItem } from './food-list-item'
import type { Food } from '@/lib/types/food'
import type { Meal } from '@/lib/types/meal'

interface SavedTabProps {
  onSelectFood: (food: Food) => void
  onQuickAddFood: (food: Food) => void
  onSelectMeal: (meal: Meal) => void
}

export function SavedTab({ onSelectFood, onQuickAddFood, onSelectMeal }: SavedTabProps) {
  const { meals, isLoading: mealsLoading } = useMeals()
  const { favorites, isLoading: favoritesLoading, toggleFavorite } = useFavorites()

  if (mealsLoading && favoritesLoading) {
    return (
      <div className="space-y-2 px-1 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-[#0f172a]" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Meals Section */}
      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-[#64748b]">Meals</h3>
        {mealsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-[#0f172a]" />
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="py-4 text-center">
            <UtensilsCrossed size={20} className="mx-auto mb-1.5 text-[#64748b]" />
            <p className="text-xs text-[#64748b]">No saved meals</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {meals.map((meal) => {
              const mealTotals = meal.foods.reduce(
                (acc, mf) => ({
                  calories: acc.calories + mf.food.calories * mf.servings,
                  protein: acc.protein + mf.food.protein * mf.servings,
                  carbs: acc.carbs + mf.food.carbs * mf.servings,
                  fat: acc.fat + mf.food.fat * mf.servings,
                }),
                { calories: 0, protein: 0, carbs: 0, fat: 0 },
              )
              const ts = meal.total_servings || 1
              const perServing = {
                calories: Math.round(mealTotals.calories / ts),
                protein: Math.round((mealTotals.protein / ts) * 10) / 10,
                carbs: Math.round((mealTotals.carbs / ts) * 10) / 10,
                fat: Math.round((mealTotals.fat / ts) * 10) / 10,
              }

              return (
                <button
                  key={meal.id}
                  onClick={() => onSelectMeal(meal)}
                  className="flex w-full items-center justify-between px-2 py-2.5 text-left transition-colors active:bg-[#0f172a]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#f8fafc]">{meal.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#64748b]">
                      {ts > 1 && <span>Makes {ts} servings</span>}
                      <span>{perServing.calories} cal</span>
                      <span>{perServing.protein}g P</span>
                      <span>{perServing.carbs}g C</span>
                      <span>{perServing.fat}g F</span>
                      {ts > 1 && <span className="text-[#94a3b8]">/ serving</span>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* Favorites Section */}
      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-[#64748b]">Favorites</h3>
        {favoritesLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-[#0f172a]" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="py-4 text-center">
            <Star size={20} className="mx-auto mb-1.5 fill-amber-400 text-amber-400" />
            <p className="text-xs text-[#64748b]">Star foods you eat often</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {favorites.map((food) => (
              <FoodListItem
                key={food.id}
                food={food}
                isFavorite={true}
                onSelect={onSelectFood}
                onQuickAdd={onQuickAddFood}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
