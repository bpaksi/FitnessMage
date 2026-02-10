import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'
import { calculateMacros } from '@/lib/utils/macro-calc'
import { getMealTypeForTime } from '@/lib/utils/meal-time'
import type { Food } from '@/lib/types/food'
import type { MealTimeBoundaries } from '@/lib/types/settings'

export async function GET(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) return error('Date is required')

    const admin = createAdminClient()
    const { data, error: dbError } = await admin
      .from('daily_log')
      .select('*, food:foods(id, name, serving_size, brand)')
      .eq('user_id', userId)
      .eq('date', date)
      .order('logged_at', { ascending: true })

    if (dbError) return error(dbError.message)
    return ok(data)
  } catch {
    return unauthorized()
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const body = await request.json()
    const admin = createAdminClient()

    // Get food details for macro snapshot
    const { data: food, error: foodError } = await admin
      .from('foods')
      .select('*')
      .eq('id', body.food_id)
      .single()

    if (foodError || !food) return error('Food not found', 404)

    const servings = body.servings || 1
    const macros = calculateMacros(food as Food, servings)

    // Get user settings for meal time boundaries
    const { data: settings } = await admin
      .from('user_settings')
      .select('meal_time_boundaries')
      .eq('user_id', userId)
      .single()

    const mealType = body.meal_type || getMealTypeForTime(undefined, settings?.meal_time_boundaries as MealTimeBoundaries | undefined)
    const date = body.date || new Date().toISOString().split('T')[0]

    const { data, error: dbError } = await admin
      .from('daily_log')
      .insert({
        user_id: userId,
        date,
        food_id: body.food_id,
        meal_type: mealType,
        servings,
        ...macros,
      })
      .select('*, food:foods(id, name, serving_size, brand)')
      .single()

    if (dbError) return error(dbError.message)
    return ok(data, 201)
  } catch {
    return unauthorized()
  }
}
