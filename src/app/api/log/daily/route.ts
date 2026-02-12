import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, error, unauthorized } from '@/lib/api/response'
import { EXTENDED_DAILY_VALUES, EXTENDED_NUTRIENT_KEYS } from '@/lib/constants/daily-values'

export async function GET(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) return error('Date is required')

    // Get entries with extended nutrient data from foods
    const { data: entries, error: logError } = await supabase
      .from('daily_log')
      .select(`
        *,
        food:foods(id, name, serving_size, brand, fiber, sugar, sodium, saturated_fat, cholesterol),
        meal:meals(id, name, total_servings, meal_foods(servings, food:foods(fiber, sugar, sodium, saturated_fat, cholesterol)))
      `)
      .eq('user_id', userId)
      .eq('date', date)
      .order('logged_at', { ascending: true })

    if (logError) return error(logError.message)

    // Get goals
    const { data: settings } = await supabase
      .from('user_settings')
      .select('goals')
      .eq('user_id', userId)
      .single()

    const goals = (settings?.goals || { calories: 2000, protein: 150, carbs: 200, fat: 65, water: 8 }) as Record<string, number>

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

    // Calculate water total (count glasses from Water food entries)
    const waterTotal = (entries || []).reduce((acc, entry) => {
      if (entry.food_id && entry.food?.name === 'Water') {
        return acc + Number(entry.servings)
      }
      return acc
    }, 0)

    // Calculate extended nutrient totals
    const extNutrientTotals: Record<string, number> = {}
    for (const key of EXTENDED_NUTRIENT_KEYS) {
      extNutrientTotals[key] = 0
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getNutrient = (obj: any, key: string): number => Number(obj?.[key]) || 0

    for (const entry of entries || []) {
      if (entry.food_id && entry.food) {
        for (const key of EXTENDED_NUTRIENT_KEYS) {
          extNutrientTotals[key] += getNutrient(entry.food, key) * entry.servings
        }
      } else if (entry.meal_id && entry.meal) {
        const mealFoods = entry.meal.meal_foods || []
        const scaleFactor = entry.meal.total_servings > 0
          ? entry.servings / entry.meal.total_servings
          : 0
        for (const mf of mealFoods) {
          if (!mf.food) continue
          for (const key of EXTENDED_NUTRIENT_KEYS) {
            extNutrientTotals[key] += getNutrient(mf.food, key) * mf.servings * scaleFactor
          }
        }
      }
    }

    const extendedNutrients: Record<string, { total: number; dailyValue: number; unit: string; label: string; color: string }> = {}
    for (const key of EXTENDED_NUTRIENT_KEYS) {
      const dv = EXTENDED_DAILY_VALUES[key]
      extendedNutrients[key] = {
        total: Math.round(extNutrientTotals[key] * 10) / 10,
        dailyValue: dv.dailyValue,
        unit: dv.unit,
        label: dv.label,
        color: dv.color,
      }
    }

    return ok({
      date,
      totals: {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        water: waterTotal,
      },
      goals: { ...goals, water: goals.water ?? 8 },
      entries: entries || [],
      extendedNutrients,
    })
  } catch {
    return unauthorized()
  }
}
