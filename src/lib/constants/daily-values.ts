export interface DailyValueInfo {
  label: string
  dailyValue: number
  unit: string
  color: string
}

export const EXTENDED_DAILY_VALUES: Record<string, DailyValueInfo> = {
  fiber: { label: 'Fiber', dailyValue: 28, unit: 'g', color: '#a3e635' },
  sugar: { label: 'Sugar', dailyValue: 50, unit: 'g', color: '#f472b6' },
  sodium: { label: 'Sodium', dailyValue: 2300, unit: 'mg', color: '#818cf8' },
  saturated_fat: { label: 'Saturated Fat', dailyValue: 20, unit: 'g', color: '#fb923c' },
  cholesterol: { label: 'Cholesterol', dailyValue: 300, unit: 'mg', color: '#a78bfa' },
}

export const EXTENDED_NUTRIENT_KEYS = Object.keys(EXTENDED_DAILY_VALUES) as (keyof typeof EXTENDED_DAILY_VALUES)[]
