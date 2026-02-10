import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'
import { pairingClaimLimiter } from '@/lib/api/rate-limit'

export async function POST(request: Request) {
  let userId: string
  try {
    const auth = await resolveUser(request)
    if (auth.authMethod !== 'session') {
      return unauthorized('Session auth required')
    }
    userId = auth.userId
  } catch {
    return unauthorized()
  }

  const rateResult = await pairingClaimLimiter(userId)
  if (!rateResult.success) {
    return error('Too many attempts', 429)
  }

  const { code } = await request.json()
  if (!code || typeof code !== 'string') {
    return error('Code is required')
  }

  const normalized = code.toUpperCase().replace(/[^ABCDEFGHJKMNPQRSTUVWXYZ23456789]/g, '')
  if (normalized.length !== 6) {
    return error('Invalid code format')
  }

  const admin = createAdminClient()
  const { data: pairingCode, error: lookupError } = await admin
    .from('pairing_codes')
    .select('id, token, device_name, device_type, device_info')
    .eq('code', normalized)
    .is('claimed_by', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (lookupError || !pairingCode) {
    return error('Invalid or expired code', 404)
  }

  // Create permanent device_tokens entry
  const { error: insertError } = await admin
    .from('device_tokens')
    .insert({
      user_id: userId,
      token: pairingCode.token,
      device_name: pairingCode.device_name,
      device_type: pairingCode.device_type,
      device_info: pairingCode.device_info,
      last_active_at: new Date().toISOString(),
      expires_at: null,
    })

  if (insertError) return error(insertError.message)

  // Mark pairing code as claimed
  await admin
    .from('pairing_codes')
    .update({ claimed_by: userId })
    .eq('id', pairingCode.id)

  return ok({ linked: true, device_name: pairingCode.device_name })
}
