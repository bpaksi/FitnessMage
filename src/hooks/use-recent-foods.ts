import useSWR from 'swr'
import { apiClient } from '@/lib/mobile/api-client'
import type { Food } from '@/lib/types/food'

export function useRecentFoods(limit = 15) {
  const { data, error, isLoading, mutate } = useSWR<Food[]>(
    `/api/foods/recent?limit=${limit}`,
    (url: string) => apiClient<Food[]>(url),
  )

  return { foods: data || [], error, isLoading, mutate }
}
