import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error } from '@/lib/api/response'
import { pairingStatusLimiter } from '@/lib/api/rate-limit'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return error('Missing token', 401)
  }

  const token = authHeader.slice(7)
  const rateResult = await pairingStatusLimiter(token)
  if (!rateResult.success) {
    return error('Too many requests', 429)
  }

  const admin = createAdminClient()
  const { data, error: dbError } = await admin
    .from('pairing_codes')
    .select('claimed_by, expires_at')
    .eq('token', token)
    .single()

  if (dbError || !data) {
    return ok({ status: 'expired' })
  }

  if (new Date(data.expires_at) < new Date() && !data.claimed_by) {
    return ok({ status: 'expired' })
  }

  if (data.claimed_by) {
    // Clean up — pairing code served its purpose
    await admin.from('pairing_codes').delete().eq('token', token)
    return ok({ status: 'linked' })
  }

  return ok({ status: 'pending' })
}
