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
      source: food.source,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to copy food: ${error.message}`)

  return copy.id
}
