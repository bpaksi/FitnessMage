import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'
import { barcodeLimiter } from '@/lib/api/rate-limit'
import { searchUSDA, transformUSDAFood } from '@/lib/external/usda'
import { searchDSLD, fetchDSLDLabel, transformDSLDFood, pickBestDSLDMatch } from '@/lib/external/dsld'
import type { Database } from '@/lib/supabase'

type FoodInsert = Database['public']['Tables']['foods']['Insert']

/** OpenFoodFacts nutriment key → DB column */
const OFF_NUTRIENT_MAP: Record<string, string> = {
  'saturated-fat_100g': 'saturated_fat',
  'trans-fat_100g': 'trans_fat',
  'cholesterol_100g': 'cholesterol',
  'monounsaturated-fat_100g': 'monounsaturated_fat',
  'polyunsaturated-fat_100g': 'polyunsaturated_fat',
  'potassium_100g': 'potassium',
  'calcium_100g': 'calcium',
  'iron_100g': 'iron',
  'magnesium_100g': 'magnesium',
  'phosphorus_100g': 'phosphorus',
  'zinc_100g': 'zinc',
  'copper_100g': 'copper',
  'selenium_100g': 'selenium',
  'manganese_100g': 'manganese',
  'vitamin-a_100g': 'vitamin_a',
  'vitamin-c_100g': 'vitamin_c',
  'vitamin-d_100g': 'vitamin_d',
  'vitamin-e_100g': 'vitamin_e',
  'vitamin-k_100g': 'vitamin_k',
  'thiamin_100g': 'thiamin',
  'riboflavin_100g': 'riboflavin',
  'niacin_100g': 'niacin',
  'vitamin-b6_100g': 'vitamin_b6',
  'folates_100g': 'folate',
  'vitamin-b12_100g': 'vitamin_b12',
  'choline_100g': 'choline',
  'retinol_100g': 'retinol',
  'caffeine_100g': 'caffeine',
  'alcohol_100g': 'alcohol',
}

const MICRO_FIELDS = [
  'fiber', 'sugar', 'sodium', 'saturated_fat', 'trans_fat', 'cholesterol',
  'potassium', 'vitamin_d', 'calcium', 'iron', 'vitamin_a', 'vitamin_c',
  'vitamin_e', 'vitamin_k', 'thiamin', 'riboflavin', 'niacin', 'vitamin_b6',
  'folate', 'vitamin_b12', 'choline', 'retinol', 'magnesium', 'phosphorus',
  'zinc', 'copper', 'selenium', 'manganese', 'monounsaturated_fat',
  'polyunsaturated_fat', 'caffeine', 'alcohol', 'water_content',
]

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** All macros are 0 and every micronutrient is null — data source had nothing */
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

/** Build a food row from OpenFoodFacts data including micronutrients */
function buildOFFFood(
  code: string,
  product: Record<string, unknown>,
  nutriments: Record<string, unknown>,
  supplement: boolean,
) {
  const micros: Record<string, number> = {}
  for (const [offKey, dbField] of Object.entries(OFF_NUTRIENT_MAP)) {
    const val = nutriments[offKey]
    if (typeof val === 'number' && val > 0) {
      micros[dbField] = round1(val)
    }
  }

  return {
    barcode: code,
    name: (product.product_name as string) || 'Unknown Product',
    brand: (product.brands as string) || null,
    serving_size: (product.serving_size as string) || '100g',
    serving_size_grams: nutriments.serving_size
      ? parseFloat(String(nutriments.serving_size))
      : 100,
    calories: Math.round((nutriments['energy-kcal_100g'] as number) || 0),
    protein: round1((nutriments.proteins_100g as number) || 0),
    carbs: round1((nutriments.carbohydrates_100g as number) || 0),
    fat: round1((nutriments.fat_100g as number) || 0),
    fiber: nutriments.fiber_100g ? round1(nutriments.fiber_100g as number) : null,
    sugar: nutriments.sugars_100g ? round1(nutriments.sugars_100g as number) : null,
    sodium: nutriments.sodium_100g
      ? Math.round((nutriments.sodium_100g as number) * 1000)
      : null,
    ...micros,
    source: 'openfoodfacts',
    category: supplement ? 'supplement' : 'food',
    user_id: null,
  }
}

export async function GET(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) return error('Barcode is required')

    const rateResult = await barcodeLimiter(userId)
    if (!rateResult.success) return error('Too many requests', 429)

    // Check local DB first (user client sees own + shared foods via RLS)
    const { data: existing } = await supabase
      .from('foods')
      .select('*')
      .eq('barcode', code)
      .single()

    // Return cached food only if it has real nutritional data
    if (existing && !isFoodDataEmpty(existing)) return ok(existing)

    // Try OpenFoodFacts
    let offProduct: Record<string, unknown> | null = null
    try {
      const offRes = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
      )
      if (offRes.ok) {
        const offData = await offRes.json()
        if (offData.status === 1) offProduct = offData.product
      }
    } catch {
      // OFF lookup failed — continue to USDA
    }

    const nutriments = (offProduct?.nutriments ?? {}) as Record<string, unknown>
    const supplement = detectSupplement(offProduct?.categories as string | undefined)
    const offFood = offProduct ? buildOFFFood(code, offProduct, nutriments, supplement) : null
    const offEmpty = offFood ? isFoodDataEmpty(offFood) : true

    // Try DSLD for supplements (accurate label data)
    let dsldFood: ReturnType<typeof transformDSLDFood> | null = null
    if (supplement && offProduct) {
      try {
        const productName = offProduct.product_name as string
        const brand = offProduct.brands as string | undefined
        const results = await searchDSLD(productName, brand)
        const bestMatch = pickBestDSLDMatch(results, productName)
        if (bestMatch) {
          const label = await fetchDSLDLabel(bestMatch.id)
          if (label) {
            dsldFood = transformDSLDFood(label)
          }
        }
      } catch {
        // DSLD lookup failed — fall through to USDA
      }
    }

    // Fall back to USDA when OFF has no nutritional data and DSLD didn't match
    let usdaFood: ReturnType<typeof transformUSDAFood> = null
    const apiKey = process.env.USDA_API_KEY
    if (offEmpty && !dsldFood && apiKey) {
      try {
        let results = await searchUSDA(code, apiKey)
        if (results.length === 0 && offProduct?.product_name) {
          results = await searchUSDA(offProduct.product_name as string, apiKey)
          // Prefer branded items — survey/research entries have unusable names
          results.sort((a, b) =>
            (a.dataType === 'Branded' ? 0 : 1) - (b.dataType === 'Branded' ? 0 : 1),
          )
        }
        for (const r of results) {
          const t = transformUSDAFood(r, { allowEmptyMacros: supplement })
          if (t) {
            usdaFood = t
            break
          }
        }
      } catch {
        // USDA lookup failed — continue with OFF data
      }
    }

    // Pick best available data
    let foodData: FoodInsert
    if (dsldFood) {
      foodData = {
        ...dsldFood,
        barcode: code,
        // Prefer OFF product name/brand — consumer-friendly
        ...(offProduct?.product_name ? { name: offProduct.product_name as string } : {}),
        ...(offProduct?.brands ? { brand: offProduct.brands as string } : {}),
      }
    } else if (usdaFood) {
      foodData = {
        ...usdaFood,
        barcode: code,
        category: supplement ? 'supplement' : 'food',
        // Prefer OFF product name/brand — USDA descriptions can be
        // research titles or generic survey names for non-branded items
        ...(offProduct?.product_name ? { name: offProduct.product_name as string } : {}),
        ...(offProduct?.brands ? { brand: offProduct.brands as string } : {}),
      }
    } else if (offFood) {
      foodData = offFood
    } else {
      return error('Product not found', 404)
    }

    // Don't return regular foods with no nutrition data — let user enter manually.
    // Supplements are still useful for their identity (name/brand/barcode) even
    // when micronutrient mapping yields no data.
    if (!supplement && isFoodDataEmpty(foodData as Record<string, unknown>)) {
      return error('Product not found', 404)
    }

    // Return preview without saving — food is persisted only when user logs it
    const now = new Date().toISOString()
    return ok({ ...foodData, id: '', created_at: now, updated_at: now })
  } catch {
    return unauthorized()
  }
}

/** Persist an external food (barcode or search) when the user logs it */
export async function POST(request: Request) {
  try {
    await resolveUser(request)
    const body = await request.json()

    if (!body.name) {
      return error('Name is required', 400)
    }

    const admin = createAdminClient()

    // Strip synthetic preview fields before saving
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, created_at: _ca, updated_at: _ua, ...foodFields } = body

    // Dedup by barcode if present
    if (body.barcode) {
      const { data: existing } = await admin
        .from('foods')
        .select('*')
        .eq('barcode', body.barcode)
        .single()

      if (existing && !isFoodDataEmpty(existing)) {
        return ok(existing)
      }

      if (existing) {
        // Update the previously cached empty row
        const { data: updated, error: updateError } = await admin
          .from('foods')
          .update(foodFields)
          .eq('id', existing.id)
          .select()
          .single()
        if (updateError) return error(updateError.message)
        return ok(updated)
      }
    }

    // Dedup by name+brand+source for non-barcode foods
    if (!body.barcode && body.source && body.source !== 'manual') {
      const query = admin
        .from('foods')
        .select('*')
        .eq('name', body.name)
        .eq('source', body.source)
        .is('user_id', null)

      if (body.brand) query.eq('brand', body.brand)
      else query.is('brand', null)

      const { data: existing } = await query.single()
      if (existing) return ok(existing)
    }

    const { data: newFood, error: insertError } = await admin
      .from('foods')
      .insert(foodFields)
      .select()
      .single()

    if (insertError) return error(insertError.message)
    return ok(newFood, 201)
  } catch {
    return unauthorized()
  }
}
