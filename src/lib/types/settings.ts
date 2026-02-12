export interface MacroGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number
}

export interface MealTimeRange {
  start: string // HH:MM
  end: string // HH:MM
}

export interface MealTimeBoundaries {
  breakfast: MealTimeRange
  lunch: MealTimeRange
  dinner: MealTimeRange
}

export type WeekStartDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type Units = 'metric' | 'imperial'

export interface UserSettings {
  user_id: string
  goals: MacroGoals
  week_start_day: WeekStartDay
  units: Units
  meal_time_boundaries: MealTimeBoundaries
  created_at: string
  updated_at: string
}
