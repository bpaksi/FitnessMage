import { resolveUser } from '@/lib/auth/resolve-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, error, unauthorized } from '@/lib/api/response'
import { barcodeLimiter } from '@/lib/api/rate-limit'

export async function GET(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) return error('Barcode is required')

    // Rate limit
    const rateResult = await barcodeLimiter(userId)
    if (!rateResult.success) return error('Too many requests', 429)

    const admin = createAdminClient()

    // Check local DB first
    const { data: existing } = await admin
      .from('foods')
      .select('*')
      .eq('barcode', code)
      .single()

    if (existing) return ok(existing)

    // Fallback to Open Food Facts
    const offRes = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
    )

    if (!offRes.ok) return error('Product not found', 404)

    const offData = await offRes.json()
    if (offData.status !== 1) return error('Product not found', 404)

    const product = offData.product
    const nutriments = product.nutriments || {}

    // Cache in local DB
    const { data: newFood, error: insertError } = await admin
      .from('foods')
      .insert({
        barcode: code,
        name: product.product_name || 'Unknown Product',
        brand: product.brands || null,
        serving_size: product.serving_size || '100g',
        serving_size_grams: nutriments.serving_size ? parseFloat(nutriments.serving_size) : 100,
        calories: Math.round(nutriments['energy-kcal_100g'] || 0),
        protein: Math.round((nutriments.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((nutriments.fat_100g || 0) * 10) / 10,
        fiber: nutriments.fiber_100g ? Math.round(nutriments.fiber_100g * 10) / 10 : null,
        sugar: nutriments.sugars_100g ? Math.round(nutriments.sugars_100g * 10) / 10 : null,
        sodium: nutriments.sodium_100g ? Math.round(nutriments.sodium_100g * 1000) : null,
        source: 'openfoodfacts',
      })
      .select()
      .single()

    if (insertError) return error(insertError.message)
    return ok(newFood)
  } catch {
    return unauthorized()
  }
}
