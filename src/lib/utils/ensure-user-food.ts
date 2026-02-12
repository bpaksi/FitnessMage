import type { SupabaseClient } from '@supabase/supabase-js'
import type { Food } from '@/lib/types/food'

/**
 * Ensures a food record is owned by the user. If the food is shared
 * (user_id IS NULL), creates or reuses a user-owned copy.
 */
export async function ensureUserFood(
  admin: SupabaseClient,
  food: Food,
  userId: string,
): Promise<string> {
  // Already owned by this user
  if (food.user_id === userId) return food.id

  // Shared food — check for existing user copy by name + brand + source
  const query = admin
    .from('foods')
    .select('id')
    .eq('user_id', userId)
    .eq('name', food.name)
    .eq('source', food.source)

  if (food.brand) {
    query.eq('brand', food.brand)
  } else {
    query.is('brand', null)
  }

  const { data: existing } = await query.maybeSingle()

  if (existing) return existing.id

  // Insert a user-owned copy (barcode = null to avoid UNIQUE constraint)
  const { data: copy, error } = await admin
    .from('foods')
    .insert({
      user_id: userId,
      name: food.name,
      brand: food.brand,
      serving_size: food.serving_size,
      serving_size_grams: food.serving_size_grams,
      barcode: null,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      sugar: food.sugar,
      sodium: food.sodium,
      saturated_fat: food.saturated_fat,
      trans_fat: food.trans_fat,
      cholesterol: food.cholesterol,
      potassium: food.potassium,
      vitamin_d: food.vitamin_d,
      calcium: food.calcium,
      iron: food.iron,
      category: food.category,
      vitamin_a: food.vitamin_a,
      vitamin_c: food.vitamin_c,
      vitamin_e: food.vitamin_e,
      vitamin_k: food.vitamin_k,
      thiamin: food.thiamin,
      riboflavin: food.riboflavin,
      niacin: food.niacin,
      vitamin_b6: food.vitamin_b6,
      folate: food.folate,
      vitamin_b12: food.vitamin_b12,
      choline: food.choline,
      retinol: food.retinol,
      magnesium: food.magnesium,
      phosphorus: food.phosphorus,
      zinc: food.zinc,
      copper: food.copper,
      selenium: food.selenium,
      manganese: food.manganese,
      monounsaturated_fat: food.monounsaturated_fat,
      polyunsaturated_fat: food.polyunsaturated_fat,
      caffeine: food.caffeine,
      alcohol: food.alcohol,
      water_content: food.water_content,
      source: food.source,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to copy food: ${error.message}`)

  return copy.id
}
