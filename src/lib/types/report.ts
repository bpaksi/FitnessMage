import type { MacroSnapshot } from './log'

export interface DailyTotal {
  date: string
  totals: MacroSnapshot
}

export interface GoalAchievement {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface ReportData {
  daily_totals: DailyTotal[]
  goals: MacroSnapshot
}

export type ReportRange = 'this_week' | 'last_week' | 'this_month' | 'last_30_days'

export interface NutrientReportEntry {
  key: string
  label: string
  unit: string
  category: 'vitamin' | 'mineral'
  dailyAverage: number
  dailyValue: number
  percentDV: number
}

export interface NutrientReportData {
  nutrients: NutrientReportEntry[]
  days_with_data: number
  date_range: { start: string; end: string }
}
