import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function GET(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const admin = createAdminClient()

    const { data, error: dbError } = await admin
      .from('food_favorites')
      .select('food_id, foods(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (dbError) return error(dbError.message)

    const foods = data?.map((f) => ({ ...f.foods, is_favorite: true })) || []
    return ok(foods)
  } catch {
    return unauthorized()
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const { food_id } = await request.json()
    const admin = createAdminClient()

    const { error: dbError } = await admin
      .from('food_favorites')
      .insert({ user_id: userId, food_id })

    if (dbError) {
      if (dbError.code === '23505') return ok({ already_exists: true })
      return error(dbError.message)
    }
    return ok({ added: true }, 201)
  } catch {
    return unauthorized()
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const { food_id } = await request.json()
    const admin = createAdminClient()

    const { error: dbError } = await admin
      .from('food_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('food_id', food_id)

    if (dbError) return error(dbError.message)
    return ok({ removed: true })
  } catch {
    return unauthorized()
  }
}
