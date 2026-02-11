import type { Food } from './food'

export interface MealFood {
  id: string
  meal_id: string
  food_id: string
  servings: number
  created_at: string
  food: Food
}

export interface Meal {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
  foods: MealFood[]
}

export interface CreateMealInput {
  name: string
  foods: { food_id: string; servings: number }[]
}
