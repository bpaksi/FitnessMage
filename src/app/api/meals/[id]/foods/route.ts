import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase } = await resolveUser(request)
    const { id: mealId } = await params
    const body = await request.json()

    const { data, error: dbError } = await supabase
      .from('meal_foods')
      .insert({
        meal_id: mealId,
        food_id: body.food_id,
        servings: body.servings || 1,
      })
      .select('*, food:foods(*)')
      .single()

    if (dbError) return error(dbError.message)

    // Touch meal updated_at
    await supabase
      .from('meals')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', mealId)

    return ok(data, 201)
  } catch {
    return unauthorized()
  }
}
