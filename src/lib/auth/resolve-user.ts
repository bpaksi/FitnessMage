import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createUserClient } from '@/lib/supabase/user-client'
import type { AuthResult } from './types'

export async function resolveUser(request: Request): Promise<AuthResult> {
  // 1. Try session auth via cookies
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const userClient = await createUserClient(user.id)
    return { userId: user.id, authMethod: 'session', supabase: userClient }
  }

  // 2. Fallback: device token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized')
  }

  const token = authHeader.slice(7)
  const admin = createAdminClient()

  const { data: deviceToken, error } = await admin
    .from('device_tokens')
    .select('user_id')
    .eq('token', token)
    .eq('revoked', false)
    .or('expires_at.is.null,expires_at.gt.now()')
    .single()

  if (error || !deviceToken) {
    throw new Error('Unauthorized')
  }

  // Update last_active_at
  await admin
    .from('device_tokens')
    .update({ last_active_at: new Date().toISOString() })
    .eq('token', token)

  const userClient = await createUserClient(deviceToken.user_id)
  return { userId: deviceToken.user_id, authMethod: 'device-token', supabase: userClient }
}
