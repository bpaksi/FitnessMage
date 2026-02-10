import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function GET(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) return error('Date is required')

    const admin = createAdminClient()

    // Get entries
    const { data: entries, error: logError } = await admin
      .from('daily_log')
      .select('*, food:foods(id, name, serving_size, brand)')
      .eq('user_id', userId)
      .eq('date', date)
      .order('logged_at', { ascending: true })

    if (logError) return error(logError.message)

    // Get goals
    const { data: settings } = await admin
      .from('user_settings')
      .select('goals')
      .eq('user_id', userId)
      .single()

    const goals = settings?.goals || { calories: 2000, protein: 150, carbs: 200, fat: 65 }

    // Calculate totals
    const totals = (entries || []).reduce(
      (acc, entry) => ({
        calories: acc.calories + Number(entry.calories),
        protein: acc.protein + Number(entry.protein),
        carbs: acc.carbs + Number(entry.carbs),
        fat: acc.fat + Number(entry.fat),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )

    return ok({
      date,
      totals: {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
      },
      goals,
      entries: entries || [],
    })
  } catch {
    return unauthorized()
  }
}
