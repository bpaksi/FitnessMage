import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, error, unauthorized } from '@/lib/api/response'

export async function POST(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    const body = await request.json()

    if (!body.name || !body.serving_size) {
      return error('Name and serving size are required', 400)
    }

    const num = (v: unknown, fallback = 0) => (typeof v === 'number' && !isNaN(v) ? v : fallback)

    const { data, error: dbError } = await supabase
      .from('foods')
      .insert({
        name: body.name,
        brand: body.brand || null,
        serving_size: body.serving_size,
        calories: num(body.calories),
        protein: num(body.protein),
        carbs: num(body.carbs),
        fat: num(body.fat),
        barcode: body.barcode || null,
        fiber: body.fiber ?? null,
        sugar: body.sugar ?? null,
        sodium: body.sodium ?? null,
        saturated_fat: body.saturated_fat ?? null,
        trans_fat: body.trans_fat ?? null,
        cholesterol: body.cholesterol ?? null,
        potassium: body.potassium ?? null,
        vitamin_d: body.vitamin_d ?? null,
        calcium: body.calcium ?? null,
        iron: body.iron ?? null,
        category: body.category || 'food',
        vitamin_a: body.vitamin_a ?? null,
        vitamin_c: body.vitamin_c ?? null,
        vitamin_e: body.vitamin_e ?? null,
        vitamin_k: body.vitamin_k ?? null,
        thiamin: body.thiamin ?? null,
        riboflavin: body.riboflavin ?? null,
        niacin: body.niacin ?? null,
        vitamin_b6: body.vitamin_b6 ?? null,
        folate: body.folate ?? null,
        vitamin_b12: body.vitamin_b12 ?? null,
        choline: body.choline ?? null,
        retinol: body.retinol ?? null,
        magnesium: body.magnesium ?? null,
        phosphorus: body.phosphorus ?? null,
        zinc: body.zinc ?? null,
        copper: body.copper ?? null,
        selenium: body.selenium ?? null,
        manganese: body.manganese ?? null,
        monounsaturated_fat: body.monounsaturated_fat ?? null,
        polyunsaturated_fat: body.polyunsaturated_fat ?? null,
        caffeine: body.caffeine ?? null,
        alcohol: body.alcohol ?? null,
        water_content: body.water_content ?? null,
        source: 'manual',
        user_id: userId,
      })
      .select()
      .single()

    if (dbError) return error(dbError.message)
    return ok(data, 201)
  } catch {
    return unauthorized()
  }
}
