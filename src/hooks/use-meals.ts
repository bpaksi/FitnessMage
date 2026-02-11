import useSWR from 'swr'
import { apiClient } from '@/lib/mobile/api-client'
import type { Meal } from '@/lib/types/meal'

export function useMeals() {
  const { data, error, isLoading, mutate } = useSWR<Meal[]>(
    '/api/meals',
    (url: string) => apiClient<Meal[]>(url),
  )

  return { meals: data || [], error, isLoading, mutate }
}
