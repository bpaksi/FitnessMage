import type { Food } from '@/lib/types/food'
import type { MacroSnapshot } from '@/lib/types/log'

export function calculateMacros(food: Food, servings: number): MacroSnapshot {
  return {
    calories: Math.round(food.calories * servings * 100) / 100,
    protein: Math.round(food.protein * servings * 100) / 100,
    carbs: Math.round(food.carbs * servings * 100) / 100,
    fat: Math.round(food.fat * servings * 100) / 100,
  }
}
