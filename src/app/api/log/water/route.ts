import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, error, unauthorized } from '@/lib/api/response'
import { getMealTypeForTime } from '@/lib/utils/meal-time'
import { ensureUserFood } from '@/lib/utils/ensure-user-food'
import type { Food } from '@/lib/types/food'
import type { MealTimeBoundaries } from '@/lib/types/settings'

export async function POST(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    const body = await request.json()

    // Find the system Water food
    const { data: waterFood, error: foodError } = await supabase
      .from('foods')
      .select('*')
      .eq('name', 'Water')
      .is('user_id', null)
      .single()

    if (foodError || !waterFood) return error('Water food not found', 404)

    const ownedFoodId = await ensureUserFood(supabase, waterFood as unknown as Food, userId)

    // Get user settings for meal time boundaries
    const { data: settings } = await supabase
      .from('user_settings')
      .select('meal_time_boundaries')
      .eq('user_id', userId)
      .single()

    const date = body.date || new Date().toISOString().split('T')[0]
    const mealType = body.meal_type || getMealTypeForTime(undefined, settings?.meal_time_boundaries as MealTimeBoundaries | undefined)
    const servings = body.servings || 1

    const { data, error: dbError } = await supabase
      .from('daily_log')
      .insert({
        user_id: userId,
        date,
        food_id: ownedFoodId,
        meal_type: mealType,
        servings,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      })
      .select('*, food:foods(id, name, serving_size, brand), meal:meals(id, name, total_servings)')
      .single()

    if (dbError) return error(dbError.message)
    return ok(data, 201)
  } catch {
    return unauthorized()
  }
}
