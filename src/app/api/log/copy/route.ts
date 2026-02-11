import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'
import { calculateMacros } from '@/lib/utils/macro-calc'
import type { Food } from '@/lib/types/food'
import { ensureUserFood } from '@/lib/utils/ensure-user-food'

export async function POST(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const { sourceDate, sourceMealType, targetDate, targetMealType } = await request.json()

    if (!sourceDate || !sourceMealType || !targetDate) {
      return error('sourceDate, sourceMealType, and targetDate are required')
    }

    const admin = createAdminClient()

    // Get source entries
    const { data: sourceEntries, error: sourceError } = await admin
      .from('daily_log')
      .select('food_id, servings, meal_type, food:foods(*)')
      .eq('user_id', userId)
      .eq('date', sourceDate)
      .eq('meal_type', sourceMealType)

    if (sourceError) return error(sourceError.message)
    if (!sourceEntries || sourceEntries.length === 0) {
      return error('No entries found for source meal')
    }

    // Create new entries with fresh macro snapshots, ensuring user-owned copies
    const newEntries = await Promise.all(
      sourceEntries.map(async (entry) => {
        const food = entry.food as unknown as Food
        const ownedFoodId = await ensureUserFood(admin, food, userId)
        const macros = calculateMacros(food, entry.servings)
        return {
          user_id: userId,
          date: targetDate,
          food_id: ownedFoodId,
          meal_type: targetMealType || entry.meal_type,
          servings: entry.servings,
          ...macros,
        }
      }),
    )

    const { data, error: insertError } = await admin
      .from('daily_log')
      .insert(newEntries)
      .select('*, food:foods(id, name, serving_size, brand)')

    if (insertError) return error(insertError.message)
    return ok(data, 201)
  } catch {
    return unauthorized()
  }
}
