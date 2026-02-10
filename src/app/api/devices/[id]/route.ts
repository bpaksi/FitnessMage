import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await resolveUser(request)
    const { id } = await params
    const admin = createAdminClient()

    const { data, error: dbError } = await admin
      .from('device_tokens')
      .update({ revoked: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (dbError) return error(dbError.message)
    return ok(data)
  } catch {
    return unauthorized()
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await resolveUser(request)
    const { id } = await params
    const admin = createAdminClient()

    const { error: dbError } = await admin
      .from('device_tokens')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (dbError) return error(dbError.message)
    return ok({ deleted: true })
  } catch {
    return unauthorized()
  }
}
