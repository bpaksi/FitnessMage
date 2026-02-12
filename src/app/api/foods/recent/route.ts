import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function GET(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '15', 10)

    // Get recently logged food IDs, deduplicated
    const { data: recentLogs, error: logError } = await supabase
      .from('daily_log')
      .select('food_id, logged_at')
      .eq('user_id', userId)
      .not('food_id', 'is', null)
      .order('logged_at', { ascending: false })
      .limit(50)

    if (logError) return error(logError.message)

    // Deduplicate food IDs while preserving order
    const seen = new Set<string>()
    const foodIds: string[] = []
    for (const log of recentLogs || []) {
      if (log.food_id && !seen.has(log.food_id)) {
        seen.add(log.food_id)
        foodIds.push(log.food_id)
        if (foodIds.length >= limit) break
      }
    }

    if (foodIds.length === 0) return ok([])

    const { data: foods, error: foodError } = await supabase
      .from('foods')
      .select('*')
      .in('id', foodIds)

    if (foodError) return error(foodError.message)

    // Sort by original order
    const foodMap = new Map(foods?.map((f) => [f.id, f]) || [])
    const ordered = foodIds.map((id) => foodMap.get(id)).filter(Boolean)

    return ok(ordered)
  } catch {
    return unauthorized()
  }
}
