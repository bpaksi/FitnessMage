import { randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { generatePairingCode } from '@/lib/auth/pairing-code'
import { ok, error } from '@/lib/api/response'
import { pairingRequestLimiter } from '@/lib/api/rate-limit'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const rateResult = await pairingRequestLimiter(ip)
  if (!rateResult.success) {
    return error('Too many requests', 429)
  }

  let device_name = 'Mobile Device'
  let device_type = 'unknown'
  let device_info = {}

  try {
    const body = await request.json()
    if (typeof body.device_name === 'string') device_name = body.device_name.slice(0, 100)
    if (typeof body.device_type === 'string' && ['phone', 'tablet', 'unknown'].includes(body.device_type)) {
      device_type = body.device_type
    }
    if (body.device_info && typeof body.device_info === 'object' && !Array.isArray(body.device_info)) {
      device_info = body.device_info
    }
  } catch {
    // Body parsing failed — use defaults
  }

  const admin = createAdminClient()

  // Clean up expired codes
  await admin
    .from('pairing_codes')
    .delete()
    .lt('expires_at', new Date().toISOString())

  const code = generatePairingCode()
  const token = randomBytes(32).toString('hex')
  const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  const { error: dbError } = await admin
    .from('pairing_codes')
    .insert({ code, token, device_name, device_type, device_info, expires_at })

  if (dbError) return error(dbError.message)

  return ok({ code, token }, 201)
}
