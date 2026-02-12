import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; foodId: string }> },
) {
  try {
    const { supabase } = await resolveUser(request)
    const { id: mealId, foodId } = await params
    const body = await request.json()

    const { data, error: dbError } = await supabase
      .from('meal_foods')
      .update({ servings: body.servings })
      .eq('id', foodId)
      .eq('meal_id', mealId)
      .select('*, food:foods(*)')
      .single()

    if (dbError) return error(dbError.message)

    // Touch meal updated_at
    await supabase
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
    const { supabase } = await resolveUser(request)
    const { id: mealId, foodId } = await params

    const { error: dbError } = await supabase
      .from('meal_foods')
      .delete()
      .eq('id', foodId)
      .eq('meal_id', mealId)

    if (dbError) return error(dbError.message)

    // Touch meal updated_at
    await supabase
      .from('meals')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', mealId)

    return ok({ success: true })
  } catch {
    return unauthorized()
  }
}
