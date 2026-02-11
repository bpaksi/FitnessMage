import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'
import { calculateMacros } from '@/lib/utils/macro-calc'
import { getMealTypeForTime } from '@/lib/utils/meal-time'
import type { Food } from '@/lib/types/food'
import type { MealTimeBoundaries } from '@/lib/types/settings'
import { ensureUserFood } from '@/lib/utils/ensure-user-food'

export async function GET(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) return error('Date is required')

    const admin = createAdminClient()
    const { data, error: dbError } = await admin
      .from('daily_log')
      .select('*, food:foods(id, name, serving_size, brand), meal:meals(id, name, total_servings)')
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

    // Get user settings for meal time boundaries
    const { data: settings } = await admin
      .from('user_settings')
      .select('meal_time_boundaries')
      .eq('user_id', userId)
      .single()

    const mealType = body.meal_type || getMealTypeForTime(undefined, settings?.meal_time_boundaries as MealTimeBoundaries | undefined)
    const date = body.date || new Date().toISOString().split('T')[0]
    const servings = body.servings || 1

    if (body.meal_id) {
      // Log a meal: look up meal + meal_foods + foods, calculate total macros, divide by total_servings
      const { data: meal, error: mealError } = await admin
        .from('meals')
        .select('*, foods:meal_foods(*, food:foods(*))')
        .eq('id', body.meal_id)
        .single()

      if (mealError || !meal) return error('Meal not found', 404)

      // Calculate total macros across all meal foods
      const mealTotals = (meal.foods || []).reduce(
        (acc: { calories: number; protein: number; carbs: number; fat: number }, mf: { servings: number; food: { calories: number; protein: number; carbs: number; fat: number } }) => ({
          calories: acc.calories + mf.food.calories * mf.servings,
          protein: acc.protein + mf.food.protein * mf.servings,
          carbs: acc.carbs + mf.food.carbs * mf.servings,
          fat: acc.fat + mf.food.fat * mf.servings,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      )

      // Per-serving = total / total_servings, then multiply by requested servings
      const totalServings = (meal as unknown as { total_servings?: number }).total_servings || 1
      const macros = {
        calories: Math.round((mealTotals.calories / totalServings) * servings * 100) / 100,
        protein: Math.round((mealTotals.protein / totalServings) * servings * 100) / 100,
        carbs: Math.round((mealTotals.carbs / totalServings) * servings * 100) / 100,
        fat: Math.round((mealTotals.fat / totalServings) * servings * 100) / 100,
      }

      const { data, error: dbError } = await admin
        .from('daily_log')
        .insert({
          user_id: userId,
          date,
          meal_id: body.meal_id,
          meal_type: mealType,
          servings,
          ...macros,
        })
        .select('*, food:foods(id, name, serving_size, brand), meal:meals(id, name, total_servings)')
        .single()

      if (dbError) return error(dbError.message)
      return ok(data, 201)
    }

    // Log a food
    const { data: food, error: foodError } = await admin
      .from('foods')
      .select('*')
      .eq('id', body.food_id)
      .single()

    if (foodError || !food) return error('Food not found', 404)

    // Ensure the user owns a copy of this food
    const ownedFoodId = await ensureUserFood(admin, food as unknown as Food, userId)

    const macros = calculateMacros(food as unknown as Food, servings)

    const { data, error: dbError } = await admin
      .from('daily_log')
      .insert({
        user_id: userId,
        date,
        food_id: ownedFoodId,
        meal_type: mealType,
        servings,
        ...macros,
      })
      .select('*, food:foods(id, name, serving_size, brand), meal:meals(id, name, total_servings)')
      .single()

    if (dbError) return error(dbError.message)
    return ok(data, 201)
  } catch {
    return unauthorized()
  }
}
