import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, error, unauthorized } from '@/lib/api/response'
import { barcodeLimiter } from '@/lib/api/rate-limit'
import { searchUSDA, transformUSDAFood } from '@/lib/external/usda'

const MICRO_FIELDS = [
  'fiber', 'sugar', 'sodium', 'saturated_fat', 'trans_fat', 'cholesterol',
  'potassium', 'vitamin_d', 'calcium', 'iron', 'vitamin_a', 'vitamin_c',
  'vitamin_e', 'vitamin_k', 'thiamin', 'riboflavin', 'niacin', 'vitamin_b6',
  'folate', 'vitamin_b12', 'choline', 'retinol', 'magnesium', 'phosphorus',
  'zinc', 'copper', 'selenium', 'manganese', 'monounsaturated_fat',
  'polyunsaturated_fat', 'caffeine', 'alcohol', 'water_content',
]

function isFoodDataEmpty(food: Record<string, unknown>): boolean {
  if (food.calories !== 0 || food.protein !== 0 || food.carbs !== 0 || food.fat !== 0) {
    return false
  }
  return MICRO_FIELDS.every((f) => food[f] == null)
}

function detectSupplement(categories?: string): boolean {
  if (!categories) return false
  const lower = categories.toLowerCase()
  return lower.includes('supplement') || lower.includes('vitamin')
}

export async function GET(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) return error('Barcode is required')

    const rateResult = await barcodeLimiter(userId)
    if (!rateResult.success) return error('Too many requests', 429)

    // Step 1: Local DB lookup
    const { data: localDb, error: dbError } = await supabase
      .from('foods')
      .select('*')
      .eq('barcode', code)
      .single()

    const localDbResult = localDb ?? null
    const localDbEmpty = localDb ? isFoodDataEmpty(localDb) : true

    // Step 2: OpenFoodFacts lookup
    let offRaw: unknown = null
    let offStatus: number | null = null
    let offProduct: Record<string, unknown> | null = null
    try {
      const offRes = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
      )
      offStatus = offRes.status
      if (offRes.ok) {
        const offData = await offRes.json()
        offRaw = offData
        if (offData.status === 1) offProduct = offData.product
      }
    } catch (e) {
      offRaw = { error: e instanceof Error ? e.message : 'Fetch failed' }
    }

    const supplement = detectSupplement(offProduct?.categories as string | undefined)

    // Step 3: USDA lookup
    const apiKey = process.env.USDA_API_KEY
    let usdaByUpc: unknown = null
    let usdaByName: unknown = null
    let usdaTransformed: unknown = null
    if (apiKey) {
      try {
        const upcResults = await searchUSDA(code, apiKey)
        usdaByUpc = upcResults
        let results = upcResults
        if (results.length === 0 && offProduct?.product_name) {
          const nameResults = await searchUSDA(offProduct.product_name as string, apiKey)
          usdaByName = nameResults
          results = nameResults
          results.sort((a, b) =>
            (a.dataType === 'Branded' ? 0 : 1) - (b.dataType === 'Branded' ? 0 : 1),
          )
        }
        for (const r of results) {
          const t = transformUSDAFood(r, { allowEmptyMacros: supplement })
          if (t) {
            usdaTransformed = t
            break
          }
        }
      } catch (e) {
        usdaByUpc = { error: e instanceof Error ? e.message : 'USDA fetch failed' }
      }
    }

    // Determine what the normal endpoint would return
    let processed: unknown
    if (localDb && !localDbEmpty) {
      processed = { action: 'returned_cached', food: localDb }
    } else if (usdaTransformed) {
      processed = { action: 'would_return_usda', food: usdaTransformed }
    } else if (offProduct) {
      processed = { action: 'would_return_off', product_name: offProduct.product_name }
    } else {
      processed = { action: 'not_found', reason: 'No data from any source' }
    }

    return ok({
      code,
      localDb: {
        result: localDbResult,
        error: dbError?.message ?? null,
        hasData: !localDbEmpty,
      },
      openFoodFacts: {
        httpStatus: offStatus,
        productFound: !!offProduct,
        product: offProduct ? {
          product_name: offProduct.product_name,
          brands: offProduct.brands,
          categories: offProduct.categories,
          serving_size: offProduct.serving_size,
          nutriments: offProduct.nutriments,
        } : null,
        raw: offRaw,
      },
      usda: {
        apiKeyConfigured: !!apiKey,
        byUpc: usdaByUpc,
        byName: usdaByName,
        transformed: usdaTransformed,
      },
      supplement,
      offEmpty: !offProduct || isFoodDataEmpty({
        calories: (offProduct?.nutriments as Record<string, unknown>)?.['energy-kcal_100g'] ?? 0,
        protein: (offProduct?.nutriments as Record<string, unknown>)?.proteins_100g ?? 0,
        carbs: (offProduct?.nutriments as Record<string, unknown>)?.carbohydrates_100g ?? 0,
        fat: (offProduct?.nutriments as Record<string, unknown>)?.fat_100g ?? 0,
      }),
      processed,
    })
  } catch {
    return unauthorized()
  }
}
