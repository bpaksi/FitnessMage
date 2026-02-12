import { resolveUser } from '@/lib/auth/resolve-user'
import { ok, error, unauthorized } from '@/lib/api/response'
import { ensureUserFood } from '@/lib/utils/ensure-user-food'
import type { Food } from '@/lib/types/food'

export async function GET(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)

    const { data, error: dbError } = await supabase
      .from('food_favorites')
      .select('food_id, foods(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (dbError) return error(dbError.message)

    // Deduplicate by name+serving_size+brand, preferring user-owned foods
    const seen = new Map<string, { food: Record<string, unknown>; hasOwner: boolean }>()
    for (const f of data || []) {
      const food = f.foods as Record<string, unknown>
      if (!food) continue
      const key = `${food.name}|${food.serving_size}|${food.brand || ''}`
      const isOwned = food.user_id !== null
      const existing = seen.get(key)
      if (!existing || (isOwned && !existing.hasOwner)) {
        seen.set(key, { food, hasOwner: isOwned })
      }
    }

    const foods = [...seen.values()].map((v) => ({ ...v.food, is_favorite: true }))
    return ok(foods)
  } catch {
    return unauthorized()
  }
}

export async function POST(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    const { food_id } = await request.json()

    // Look up the food and ensure we favorite the user-owned copy
    const { data: food, error: foodError } = await supabase
      .from('foods')
      .select('*')
      .eq('id', food_id)
      .single()

    if (foodError || !food) return error('Food not found', 404)

    const ownedFoodId = await ensureUserFood(supabase, food as unknown as Food, userId)

    const { error: dbError } = await supabase
      .from('food_favorites')
      .insert({ user_id: userId, food_id: ownedFoodId })

    if (dbError) {
      if (dbError.code === '23505') return ok({ already_exists: true })
      return error(dbError.message)
    }
    return ok({ added: true }, 201)
  } catch {
    return unauthorized()
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    const { food_id } = await request.json()

    // Look up the food to find duplicates (system + user-owned copies)
    const { data: food } = await supabase
      .from('foods')
      .select('name, serving_size, brand')
      .eq('id', food_id)
      .single<{ name: string; serving_size: string | null; brand: string | null }>()

    if (food) {
      // Find all food IDs with the same name+serving_size+brand
      const query = supabase
        .from('foods')
        .select('id')
        .eq('name', food.name)

      if (food.serving_size) {
        query.eq('serving_size', food.serving_size)
      } else {
        query.is('serving_size', null)
      }

      if (food.brand) {
        query.eq('brand', food.brand)
      } else {
        query.is('brand', null)
      }

      const { data: matchingFoods } = await query
      const foodIds = matchingFoods?.map((f) => f.id) || [food_id]

      const { error: dbError } = await supabase
        .from('food_favorites')
        .delete()
        .eq('user_id', userId)
        .in('food_id', foodIds)

      if (dbError) return error(dbError.message)
    } else {
      // Fallback: delete by exact food_id
      const { error: dbError } = await supabase
        .from('food_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('food_id', food_id)

      if (dbError) return error(dbError.message)
    }

    return ok({ removed: true })
  } catch {
    return unauthorized()
  }
}
