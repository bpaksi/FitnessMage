import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function POST(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const body = await request.json()
    const admin = createAdminClient()

    const { data, error: dbError } = await admin
      .from('foods')
      .insert({
        name: body.name,
        brand: body.brand || null,
        serving_size: body.serving_size,
        calories: body.calories,
        protein: body.protein,
        carbs: body.carbs,
        fat: body.fat,
        barcode: body.barcode || null,
        source: 'manual',
        user_id: userId,
      })
      .select()
      .single()

    if (dbError) return error(dbError.message)
    return ok(data, 201)
  } catch {
    return unauthorized()
  }
}
