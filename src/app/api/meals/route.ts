import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'
import type { CreateMealInput } from '@/lib/types/meal'

export async function GET(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const admin = createAdminClient()

    const { data, error: dbError } = await admin
      .from('meals')
      .select('*, foods:meal_foods(*, food:foods(*))')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (dbError) return error(dbError.message)
    return ok(data)
  } catch {
    return unauthorized()
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const body: CreateMealInput = await request.json()
    const admin = createAdminClient()

    if (!body.name?.trim()) return error('Meal name is required')

    // Insert meal
    const { data: meal, error: mealError } = await admin
      .from('meals')
      .insert({ user_id: userId, name: body.name.trim() })
      .select()
      .single()

    if (mealError) return error(mealError.message)

    // Insert meal_foods
    if (body.foods?.length) {
      const mealFoods = body.foods.map((f) => ({
        meal_id: meal.id,
        food_id: f.food_id,
        servings: f.servings,
      }))

      const { error: foodsError } = await admin.from('meal_foods').insert(mealFoods)
      if (foodsError) return error(foodsError.message)
    }

    // Return joined result
    const { data: result, error: fetchError } = await admin
      .from('meals')
      .select('*, foods:meal_foods(*, food:foods(*))')
      .eq('id', meal.id)
      .single()

    if (fetchError) return error(fetchError.message)
    return ok(result, 201)
  } catch {
    return unauthorized()
  }
}
