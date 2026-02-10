import useSWR from 'swr'
import { apiClient } from '@/lib/mobile/api-client'

interface WeekDay {
  date: string
  totals: { calories: number; protein: number; carbs: number; fat: number } | null
}

interface WeeklySummary {
  dates: string[]
  days: WeekDay[]
  goals: { calories: number; protein: number; carbs: number; fat: number }
}

export function useWeeklySummary(weekOf: string) {
  const { data, error, isLoading, mutate } = useSWR<WeeklySummary>(
    weekOf ? `/api/log/weekly?weekOf=${weekOf}` : null,
    (url: string) => apiClient<WeeklySummary>(url),
  )

  return { weekly: data, error, isLoading, mutate }
}
