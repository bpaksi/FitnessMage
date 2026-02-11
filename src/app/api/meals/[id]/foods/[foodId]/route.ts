import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; foodId: string }> },
) {
  try {
    const { userId } = await resolveUser(request)
    const { id: mealId, foodId } = await params
    const body = await request.json()
    const admin = createAdminClient()

    // Verify meal ownership
    const { data: meal } = await admin
      .from('meals')
      .select('user_id')
      .eq('id', mealId)
      .single()

    if (!meal) return error('Meal not found', 404)
    if (meal.user_id !== userId) return error('Not authorized', 403)

    const { data, error: dbError } = await admin
      .from('meal_foods')
      .update({ servings: body.servings })
      .eq('id', foodId)
      .eq('meal_id', mealId)
      .select('*, food:foods(*)')
      .single()

    if (dbError) return error(dbError.message)

    // Touch meal updated_at
    await admin
      .from('meals')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', mealId)

    return ok(data)
  } catch {
    return unauthorized()
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; foodId: string }> },
) {
  try {
    const { userId } = await resolveUser(request)
    const { id: mealId, foodId } = await params
    const admin = createAdminClient()

    // Verify meal ownership
    const { data: meal } = await admin
      .from('meals')
      .select('user_id')
      .eq('id', mealId)
      .single()

    if (!meal) return error('Meal not found', 404)
    if (meal.user_id !== userId) return error('Not authorized', 403)

    const { error: dbError } = await admin
      .from('meal_foods')
      .delete()
      .eq('id', foodId)
      .eq('meal_id', mealId)

    if (dbError) return error(dbError.message)

    // Touch meal updated_at
    await admin
      .from('meals')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', mealId)

    return ok({ success: true })
  } catch {
    return unauthorized()
  }
}
