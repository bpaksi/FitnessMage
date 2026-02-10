import useSWR from 'swr'
import { apiClient } from '@/lib/mobile/api-client'
import type { Food } from '@/lib/types/food'

export function useFoodSearch(query: string) {
  const trimmed = query.trim()
  const { data, error, isLoading } = useSWR<Food[]>(
    trimmed.length >= 2 ? `/api/foods/search?q=${encodeURIComponent(trimmed)}` : null,
    (url: string) => apiClient<Food[]>(url),
    { dedupingInterval: 300 },
  )

  return { foods: data || [], error, isLoading }
}
