import useSWR from 'swr'
import { apiClient } from '@/lib/mobile/api-client'
import type { DailySummary } from '@/lib/types/log'

export function useDailySummary(date: string) {
  const { data, error, isLoading, mutate } = useSWR<DailySummary>(
    date ? `/api/log/daily?date=${date}` : null,
    (url: string) => apiClient<DailySummary>(url),
  )

  return { summary: data, error, isLoading, mutate }
}
