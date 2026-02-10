import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, unauthorized } from '@/lib/api/response'

export async function GET(request: Request) {
  try {
    await resolveUser(request)
    return ok({ valid: true })
  } catch {
    return unauthorized()
  }
}
