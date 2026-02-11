export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface MacroSnapshot {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface DailyLogEntry {
  id: string
  user_id: string
  date: string
  food_id: string | null
  meal_id: string | null
  meal_type: MealType
  servings: number
  calories: number
  protein: number
  carbs: number
  fat: number
  logged_at: string
  food?: {
    id: string
    name: string
    serving_size: string | null
    brand: string | null
  }
  meal?: {
    id: string
    name: string
    total_servings: number
  }
}

export interface ExtendedNutrientSummary {
  total: number
  dailyValue: number
  unit: string
  label: string
  color: string
}

export interface DailySummary {
  date: string
  totals: MacroSnapshot
  goals: MacroSnapshot
  entries: DailyLogEntry[]
  extendedNutrients: Record<string, ExtendedNutrientSummary>
}
