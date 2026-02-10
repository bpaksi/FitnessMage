import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function GET(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const admin = createAdminClient()

    // Clean up expired pending tokens (never accepted, past expiry)
    await admin
      .from('device_tokens')
      .delete()
      .eq('user_id', userId)
      .is('last_active_at', null)
      .lt('expires_at', new Date().toISOString())

    // Return only accepted devices (last_active_at is set on first verify)
    const { data, error: dbError } = await admin
      .from('device_tokens')
      .select('id, device_name, device_type, created_at, last_active_at, revoked')
      .eq('user_id', userId)
      .not('last_active_at', 'is', null)
      .order('created_at', { ascending: false })

    if (dbError) return error(dbError.message)
    return ok(data)
  } catch {
    return unauthorized()
  }
}
