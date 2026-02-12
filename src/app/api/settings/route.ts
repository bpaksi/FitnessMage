import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function GET(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)

    const { data, error: dbError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (dbError) return error(dbError.message)
    return ok(data)
  } catch {
    return unauthorized()
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    const body = await request.json()

    const { data, error: dbError } = await supabase
      .from('user_settings')
      .update({
        goals: body.goals,
        week_start_day: body.week_start_day,
        units: body.units,
        meal_time_boundaries: body.meal_time_boundaries,
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (dbError) return error(dbError.message)
    return ok(data)
  } catch {
    return unauthorized()
  }
}
