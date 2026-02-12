import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, error, unauthorized } from '@/lib/api/response'

const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

function getWeekDates(weekOf: string, weekStartDay: string): string[] {
  const date = new Date(weekOf + 'T12:00:00')
  const dayOfWeek = date.getDay()
  const startDayNum = DAY_MAP[weekStartDay] ?? 1

  let diff = dayOfWeek - startDayNum
  if (diff < 0) diff += 7

  const weekStart = new Date(date)
  weekStart.setDate(date.getDate() - diff)

  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export async function GET(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const weekOf = searchParams.get('weekOf')

    if (!weekOf) return error('weekOf is required')

    // Get user settings for week_start_day and goals
    const { data: settings } = await supabase
      .from('user_settings')
      .select('week_start_day, goals')
      .eq('user_id', userId)
      .single()

    const weekStartDay = settings?.week_start_day || 'monday'
    const defaults = { calories: 2000, protein: 150, carbs: 200, fat: 65, water: 8 }
    const goals = settings?.goals
      ? { ...defaults, ...(settings.goals as Record<string, number>) }
      : defaults
    const dates = getWeekDates(weekOf, weekStartDay)

    // Get all logs for the week (include food name for water detection)
    const { data: entries, error: dbError } = await supabase
      .from('daily_log')
      .select('date, calories, protein, carbs, fat, servings, food_id, food:foods(name)')
      .eq('user_id', userId)
      .gte('date', dates[0])
      .lte('date', dates[6])

    if (dbError) return error(dbError.message)

    // Aggregate by date
    const dayTotals = new Map<string, { calories: number; protein: number; carbs: number; fat: number; water: number }>()
    for (const entry of entries || []) {
      const existing = dayTotals.get(entry.date) || { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isWater = entry.food_id && (entry.food as any)?.name === 'Water'
      dayTotals.set(entry.date, {
        calories: existing.calories + Number(entry.calories),
        protein: existing.protein + Number(entry.protein),
        carbs: existing.carbs + Number(entry.carbs),
        fat: existing.fat + Number(entry.fat),
        water: existing.water + (isWater ? Number(entry.servings) : 0),
      })
    }

    const days = dates.map((date) => ({
      date,
      totals: dayTotals.get(date) || null,
    }))

    return ok({ dates, days, goals })
  } catch {
    return unauthorized()
  }
}
