import useSWR from 'swr'
import { apiClient } from '@/lib/mobile/api-client'
import type { Food } from '@/lib/types/food'

export function useFavorites() {
  const { data, error, isLoading, mutate } = useSWR<Food[]>(
    '/api/foods/favorites',
    (url: string) => apiClient<Food[]>(url),
  )

  async function toggleFavorite(foodId: string, isFavorite: boolean) {
    const currentFoods = data || []

    if (isFavorite) {
      // Optimistic remove
      mutate(
        currentFoods.filter((f) => f.id !== foodId),
        false,
      )
      await apiClient('/api/foods/favorites', {
        method: 'DELETE',
        body: { food_id: foodId },
      })
    } else {
      // Add favorite
      await apiClient('/api/foods/favorites', {
        method: 'POST',
        body: { food_id: foodId },
      })
    }

    mutate()
  }

  return { favorites: data || [], error, isLoading, mutate, toggleFavorite }
}
