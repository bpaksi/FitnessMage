import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, error, unauthorized } from '@/lib/api/response'
import { getDateRange } from '@/lib/utils/date-range'
import type { ReportRange } from '@/lib/types/report'

export async function GET(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') || 'this_week') as ReportRange

    const validRanges: ReportRange[] = ['this_week', 'last_week', 'this_month', 'last_30_days']
    if (!validRanges.includes(range)) return error('Invalid range')

    // Get user settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('week_start_day, goals')
      .eq('user_id', userId)
      .single()

    const weekStartDay = settings?.week_start_day || 'monday'
    const goals = settings?.goals || { calories: 2000, protein: 150, carbs: 200, fat: 65 }
    const { start, end } = getDateRange(range, weekStartDay)

    // Query daily_log entries in range
    const { data: entries, error: dbError } = await supabase
      .from('daily_log')
      .select('date, calories, protein, carbs, fat')
      .eq('user_id', userId)
      .gte('date', start)
      .lte('date', end)

    if (dbError) return error(dbError.message)

    // Aggregate by date
    const dayTotals = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>()
    for (const entry of entries || []) {
      const existing = dayTotals.get(entry.date) || { calories: 0, protein: 0, carbs: 0, fat: 0 }
      dayTotals.set(entry.date, {
        calories: existing.calories + Number(entry.calories),
        protein: existing.protein + Number(entry.protein),
        carbs: existing.carbs + Number(entry.carbs),
        fat: existing.fat + Number(entry.fat),
      })
    }

    const daily_totals = Array.from(dayTotals.entries())
      .map(([date, totals]) => ({
        date,
        totals: {
          calories: Math.round(totals.calories),
          protein: Math.round(totals.protein * 10) / 10,
          carbs: Math.round(totals.carbs * 10) / 10,
          fat: Math.round(totals.fat * 10) / 10,
        },
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return ok({ daily_totals, goals })
  } catch {
    return unauthorized()
  }
}
