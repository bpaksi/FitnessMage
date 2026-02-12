import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, error, unauthorized } from '@/lib/api/response'
import { getDateRange } from '@/lib/utils/date-range'
import { NUTRIENT_INFO } from '@/lib/constants/nutrients'
import type { ReportRange, NutrientReportEntry } from '@/lib/types/report'

const NUTRIENT_COLUMNS = Object.entries(NUTRIENT_INFO)
  .filter(([, info]) => (info.category === 'vitamin' || info.category === 'mineral') && info.dailyValue > 0)
  .map(([key]) => key)

export async function GET(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') || 'this_week') as ReportRange

    const validRanges: ReportRange[] = ['this_week', 'last_week', 'this_month', 'last_30_days']
    if (!validRanges.includes(range)) return error('Invalid range')

    const { data: settings } = await supabase
      .from('user_settings')
      .select('week_start_day')
      .eq('user_id', userId)
      .single()

    const weekStartDay = settings?.week_start_day || 'monday'
    const dateRange = getDateRange(range, weekStartDay)

    // Get daily_log entries with food nutrient data
    const { data: entries, error: logError } = await supabase
      .from('daily_log')
      .select(`
        date, servings, food_id, meal_id,
        food:foods(
          vitamin_a, vitamin_c, vitamin_d, vitamin_e, vitamin_k,
          thiamin, riboflavin, niacin, vitamin_b6, folate, vitamin_b12, choline, retinol,
          sodium, calcium, iron, potassium, magnesium, phosphorus, zinc, copper, selenium, manganese
        ),
        meal:meals(total_servings, meal_foods(servings, food:foods(
          vitamin_a, vitamin_c, vitamin_d, vitamin_e, vitamin_k,
          thiamin, riboflavin, niacin, vitamin_b6, folate, vitamin_b12, choline, retinol,
          sodium, calcium, iron, potassium, magnesium, phosphorus, zinc, copper, selenium, manganese
        )))
      `)
      .eq('user_id', userId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)

    if (logError) return error(logError.message)

    // Aggregate nutrient totals across the range
    const totals: Record<string, number> = {}
    for (const key of NUTRIENT_COLUMNS) {
      totals[key] = 0
    }

    const datesWithData = new Set<string>()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getNutrient = (obj: any, key: string): number => Number(obj?.[key]) || 0

    for (const entry of entries || []) {
      if (entry.food_id && entry.food) {
        let hasNutrientData = false
        for (const key of NUTRIENT_COLUMNS) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const val = getNutrient(entry.food as any, key) * entry.servings
          if (val > 0) hasNutrientData = true
          totals[key] += val
        }
        if (hasNutrientData) datesWithData.add(entry.date)
      } else if (entry.meal_id && entry.meal) {
        const mealFoods = entry.meal.meal_foods || []
        const scaleFactor = entry.meal.total_servings > 0
          ? entry.servings / entry.meal.total_servings
          : 0
        let hasNutrientData = false
        for (const mf of mealFoods) {
          if (!mf.food) continue
          for (const key of NUTRIENT_COLUMNS) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const val = getNutrient(mf.food as any, key) * mf.servings * scaleFactor
            if (val > 0) hasNutrientData = true
            totals[key] += val
          }
        }
        if (hasNutrientData) datesWithData.add(entry.date)
      }
    }

    const daysWithData = datesWithData.size

    // Compute daily averages and % DV
    const nutrients: NutrientReportEntry[] = NUTRIENT_COLUMNS.map((key) => {
      const info = NUTRIENT_INFO[key]
      const dailyAverage = daysWithData > 0 ? totals[key] / daysWithData : 0
      const percentDV = info.dailyValue > 0 ? (dailyAverage / info.dailyValue) * 100 : 0
      return {
        key,
        label: info.label,
        unit: info.unit,
        category: info.category as 'vitamin' | 'mineral',
        dailyAverage: Math.round(dailyAverage * 10) / 10,
        dailyValue: info.dailyValue,
        percentDV: Math.round(percentDV),
      }
    })

    return ok({
      nutrients,
      days_with_data: daysWithData,
      date_range: dateRange,
    })
  } catch {
    return unauthorized()
  }
}
