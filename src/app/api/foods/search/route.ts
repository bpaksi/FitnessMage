import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, unauthorized } from '@/lib/api/response'
import { usdaSearchLimiter } from '@/lib/api/rate-limit'
import { searchUSDA, transformUSDAFood } from '@/lib/external/usda'

export async function GET(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.length < 2) return ok([])

    const admin = createAdminClient()
    const apiKey = process.env.USDA_API_KEY

    // Check rate limit before firing USDA request
    const canCallUSDA = apiKey ? await usdaSearchLimiter(userId) : null

    const [localResult, usdaResult] = await Promise.allSettled([
      admin
        .from('foods')
        .select('*')
        .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
        .order('name')
        .limit(20),
      canCallUSDA?.success
        ? searchUSDA(q, apiKey!)
        : Promise.resolve([]),
    ])

    // Local results
    const localFoods =
      localResult.status === 'fulfilled' && !localResult.value.error
        ? localResult.value.data ?? []
        : []

    const usdaRaw =
      usdaResult.status === 'fulfilled' ? usdaResult.value : []

    // Transform and filter USDA results
    const usdaFoods = usdaRaw
      .map(transformUSDAFood)
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

    if (uniqueUSDA.length === 0) return ok(localFoods.slice(0, 25))

    // Cache new USDA foods in DB (best-effort, don't fail the request)
    // Split into foods with barcodes and without for proper conflict handling
    const withBarcode = uniqueUSDA.filter((f) => f.barcode)
    const withoutBarcode = uniqueUSDA.filter((f) => !f.barcode)

    let cachedUSDA: unknown[] = []
    try {
      const results: unknown[][] = []

      if (withBarcode.length > 0) {
        const { data } = await admin
          .from('foods')
          .upsert(withBarcode, { onConflict: 'barcode', ignoreDuplicates: true })
          .select()
        if (data) results.push(data)
      }
      if (withoutBarcode.length > 0) {
        // Deduplicate: find which foods already exist by (name, brand, source)
        const names = withoutBarcode.map((f) => f.name)
        const { data: existing } = await admin
          .from('foods')
          .select('name, brand')
          .eq('source', 'usda')
          .is('user_id', null)
          .in('name', names)

        const existingKeys = new Set(
          (existing ?? []).map(
            (f: { name: string; brand: string | null }) =>
              `${f.name.toLowerCase()}|${(f.brand ?? '').toLowerCase()}`,
          ),
        )

        const toInsert = withoutBarcode.filter(
          (f) => !existingKeys.has(`${f.name.toLowerCase()}|${(f.brand ?? '').toLowerCase()}`),
        )

        if (toInsert.length > 0) {
          const { data } = await admin
            .from('foods')
            .insert(toInsert)
            .select()
          if (data) results.push(data)
        }

        // Also return already-cached foods so they appear in results
        if (existing && existing.length > 0) {
          const { data: cachedFoods } = await admin
            .from('foods')
            .select('*')
            .eq('source', 'usda')
            .is('user_id', null)
            .in('name', existing.map((f: { name: string }) => f.name))
          if (cachedFoods) results.push(cachedFoods)
        }
      }

      cachedUSDA = results.flat()
    } catch {
      // Cache failure is non-fatal — return transformed data directly
      cachedUSDA = uniqueUSDA
    }

    // Merge: local first, then USDA, capped at 25
    const remaining = 25 - localFoods.length
    const merged = [...localFoods, ...cachedUSDA.slice(0, Math.max(0, remaining))]

    return ok(merged)
  } catch {
    return unauthorized()
  }
}
