import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function GET(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const admin = createAdminClient()

    const { data, error: dbError } = await admin
      .from('foods')
      .select('*')
      .eq('source', 'manual')
      .eq('user_id', userId)
      .order('name')

    if (dbError) return error(dbError.message)
    return ok(data)
  } catch {
    return unauthorized()
  }
}
