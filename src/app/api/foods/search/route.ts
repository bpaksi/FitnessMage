import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function GET(request: Request) {
  try {
    await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.length < 2) return ok([])

    const admin = createAdminClient()
    const { data, error: dbError } = await admin
      .from('foods')
      .select('*')
      .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
      .order('name')
      .limit(20)

    if (dbError) return error(dbError.message)
    return ok(data)
  } catch {
    return unauthorized()
  }
}
