import useSWR from 'swr'
import { apiClient } from '@/lib/mobile/api-client'
import type { DailyLogEntry } from '@/lib/types/log'

export function useDailyLog(date: string) {
  const { data, error, isLoading, mutate } = useSWR<DailyLogEntry[]>(
    date ? `/api/log?date=${date}` : null,
    (url: string) => apiClient<DailyLogEntry[]>(url),
  )

  return { entries: data || [], error, isLoading, mutate }
}
