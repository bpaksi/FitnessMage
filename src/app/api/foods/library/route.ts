import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function GET(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)

    // 1. Get user's manual foods
    const { data: manualFoods, error: manualError } = await supabase
      .from('foods')
      .select('*')
      .eq('source', 'manual')
      .eq('user_id', userId)

    if (manualError) return error(manualError.message)

    // 2. Get distinct food_ids from the user's daily log
    const { data: logEntries, error: logError } = await supabase
      .from('daily_log')
      .select('food_id')
      .eq('user_id', userId)
      .not('food_id', 'is', null)

    if (logError) return error(logError.message)

    const manualIds = new Set((manualFoods || []).map((f) => f.id))
    const loggedFoodIds = [...new Set(
      (logEntries || [])
        .map((e) => e.food_id)
        .filter((id): id is string => id !== null && !manualIds.has(id)),
    )]

    // 3. Fetch logged foods not already in manual list
    let loggedFoods: typeof manualFoods = []
    if (loggedFoodIds.length > 0) {
      const { data, error: foodsError } = await supabase
        .from('foods')
        .select('*')
        .in('id', loggedFoodIds)

      if (foodsError) return error(foodsError.message)
      loggedFoods = data || []
    }

    // 4. Merge and sort by name
    const allFoods = [...(manualFoods || []), ...loggedFoods]
    allFoods.sort((a, b) => a.name.localeCompare(b.name))

    return ok(allFoods)
  } catch {
    return unauthorized()
  }
}
