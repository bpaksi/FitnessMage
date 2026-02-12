import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, unauthorized } from '@/lib/api/response'
import { usdaSearchLimiter } from '@/lib/api/rate-limit'
import { searchUSDA, transformUSDAFood } from '@/lib/external/usda'

export async function GET(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.length < 2) return ok([])

    const apiKey = process.env.USDA_API_KEY

    // Check rate limit before firing USDA request
    const canCallUSDA = apiKey ? await usdaSearchLimiter(userId) : null

    const [localResult, usdaResult] = await Promise.allSettled([
      supabase
        .from('foods')
        .select('*')
        .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
        .order('name')
        .limit(20),
      canCallUSDA?.success
        ? searchUSDA(q, apiKey!)
        : Promise.resolve([]),
    ])

    // Local results (already persisted, have real ids)
    const localFoods =
      localResult.status === 'fulfilled' && !localResult.value.error
        ? localResult.value.data ?? []
        : []

    const usdaRaw =
      usdaResult.status === 'fulfilled' ? usdaResult.value : []

    // Transform USDA results into previews (no id — saved only when logged)
    const now = new Date().toISOString()
    const usdaFoods = usdaRaw
      .map((f) => {
        const t = transformUSDAFood(f)
        return t ? { ...t, id: '', created_at: now, updated_at: now } : null
      })
      .filter((f): f is NonNullable<typeof f> => f !== null)

    if (usdaFoods.length === 0) return ok(localFoods.slice(0, 25))

    // Deduplicate: skip USDA foods already in local results
    const localKeys = new Set(
      localFoods.map(
        (f: { name: string; brand: string | null }) =>
          `${f.name.toLowerCase()}|${(f.brand ?? '').toLowerCase()}`,
      ),
    )

    const uniqueUSDA = usdaFoods.filter(
      (f) => !localKeys.has(`${f.name.toLowerCase()}|${(f.brand ?? '').toLowerCase()}`),
    )

    // Merge: local first, then USDA previews, capped at 25
    const remaining = 25 - localFoods.length
    const merged = [...localFoods, ...uniqueUSDA.slice(0, Math.max(0, remaining))]

    return ok(merged)
  } catch {
    return unauthorized()
  }
}
