import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await resolveUser(request)
    const { id } = await params
    const admin = createAdminClient()

    const { data, error: dbError } = await admin
      .from('foods')
      .select('*')
      .eq('id', id)
      .single()

    if (dbError) return error(dbError.message, 404)
    return ok(data)
  } catch {
    return unauthorized()
  }
}

export async function PUT(
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
      .from('foods')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing) return error('Food not found', 404)
    if (existing.user_id !== userId) {
      return error('Not authorized to edit this food', 403)
    }

    const { data, error: dbError } = await admin
      .from('foods')
      .update({
        name: body.name,
        brand: body.brand || null,
        serving_size: body.serving_size,
        barcode: body.barcode || null,
        calories: body.calories,
        protein: body.protein,
        carbs: body.carbs,
        fat: body.fat,
        fiber: body.fiber ?? null,
        sugar: body.sugar ?? null,
        sodium: body.sodium ?? null,
        saturated_fat: body.saturated_fat ?? null,
        trans_fat: body.trans_fat ?? null,
        cholesterol: body.cholesterol ?? null,
        potassium: body.potassium ?? null,
        vitamin_d: body.vitamin_d ?? null,
        calcium: body.calcium ?? null,
        iron: body.iron ?? null,
      })
      .eq('id', id)
      .select()
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
      .from('foods')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing) return error('Food not found', 404)
    if (existing.user_id !== userId) return error('Not authorized', 403)

    const { error: dbError } = await admin.from('foods').delete().eq('id', id)

    if (dbError) return error(dbError.message)
    return ok({ success: true })
  } catch {
    return unauthorized()
  }
}
