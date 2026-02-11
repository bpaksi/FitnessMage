import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'
import { calculateMacros } from '@/lib/utils/macro-calc'
import type { Food } from '@/lib/types/food'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await resolveUser(request)
    const { id } = await params
    const body = await request.json()
    const admin = createAdminClient()

    // Get current entry
    const { data: entry } = await admin
      .from('daily_log')
      .select('*, food:foods(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!entry) return error('Entry not found', 404)

    const updates: Record<string, unknown> = {}

    if (body.servings !== undefined) {
      const food = entry.food as unknown as Food
      const macros = calculateMacros(food, body.servings)
      updates.servings = body.servings
      updates.calories = macros.calories
      updates.protein = macros.protein
      updates.carbs = macros.carbs
      updates.fat = macros.fat
    }

    if (body.meal_type !== undefined) {
      updates.meal_type = body.meal_type
    }

    const { data, error: dbError } = await admin
      .from('daily_log')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, food:foods(id, name, serving_size, brand)')
      .single()

    if (dbError) return error(dbError.message)
    return ok(data)
  } catch {
    return unauthorized()
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await resolveUser(request)
    const { id } = await params
    const admin = createAdminClient()

    const { error: dbError } = await admin
      .from('daily_log')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (dbError) return error(dbError.message)
    return ok({ deleted: true })
  } catch {
    return unauthorized()
  }
}
