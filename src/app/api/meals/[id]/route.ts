import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await resolveUser(request)
    const { id } = await params
    const admin = createAdminClient()

    const { data, error: dbError } = await admin
      .from('meals')
      .select('*, foods:meal_foods(*, food:foods(*))')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (dbError) return error('Meal not found', 404)
    return ok(data)
  } catch {
    return unauthorized()
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await resolveUser(request)
    const { id } = await params
    const body = await request.json()
    const admin = createAdminClient()

    // Verify ownership
    const { data: existing } = await admin
      .from('meals')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing) return error('Meal not found', 404)
    if (existing.user_id !== userId) return error('Not authorized', 403)

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.name !== undefined) updateData.name = body.name
    if (body.total_servings !== undefined) updateData.total_servings = body.total_servings

    const { data, error: dbError } = await admin
      .from('meals')
      .update(updateData)
      .eq('id', id)
      .select('*, foods:meal_foods(*, food:foods(*))')
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

    // Verify ownership
    const { data: existing } = await admin
      .from('meals')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing) return error('Meal not found', 404)
    if (existing.user_id !== userId) return error('Not authorized', 403)

    // Delete meal_foods first, then meal
    await admin.from('meal_foods').delete().eq('meal_id', id)
    const { error: dbError } = await admin.from('meals').delete().eq('id', id)

    if (dbError) return error(dbError.message)
    return ok({ success: true })
  } catch {
    return unauthorized()
  }
}
