const BASE_URL = 'https://api.ods.od.nih.gov/dsld/v9'

interface DSLDSearchHit {
  _id: string
  _score: number
  _source: {
    fullName: string
    brandName: string
  }
}

interface DSLDSearchResponse {
  hits: DSLDSearchHit[]
}

interface DSLDIngredientQuantity {
  quantity: number
  unit: string
}

interface DSLDIngredientRow {
  name: string
  category: string
  quantity: DSLDIngredientQuantity[]
}

interface DSLDServingSize {
  minQuantity: number
  maxQuantity: number
  unit: string
}

export interface DSLDLabel {
  id: string
  fullName: string
  brandName: string
  ingredientRows: DSLDIngredientRow[]
  servingSizes: DSLDServingSize[]
}

export interface DSLDSearchResult {
  id: string
  score: number
  fullName: string
  brandName: string
}

/** DSLD ingredient name → Food type field */
const INGREDIENT_MAP: Record<string, string> = {
  'Vitamin A': 'vitamin_a',
  'Vitamin C': 'vitamin_c',
  'Vitamin D': 'vitamin_d',
  'Vitamin D3': 'vitamin_d',
  'Vitamin D2': 'vitamin_d',
  'Vitamin E': 'vitamin_e',
  'Vitamin K': 'vitamin_k',
  'Vitamin K1': 'vitamin_k',
  'Vitamin K2': 'vitamin_k',
  'Thiamin': 'thiamin',
  'Thiamine': 'thiamin',
  'Riboflavin': 'riboflavin',
  'Niacin': 'niacin',
  'Niacinamide': 'niacin',
  'Vitamin B6': 'vitamin_b6',
  'Folate': 'folate',
  'Folic Acid': 'folate',
  'Vitamin B12': 'vitamin_b12',
  'Calcium': 'calcium',
  'Iron': 'iron',
  'Magnesium': 'magnesium',
  'Zinc': 'zinc',
  'Selenium': 'selenium',
  'Copper': 'copper',
  'Manganese': 'manganese',
  'Phosphorus': 'phosphorus',
  'Potassium': 'potassium',
  'Choline': 'choline',
  'Sodium': 'sodium',
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export async function searchDSLD(
  productName: string,
  brand?: string,
): Promise<DSLDSearchResult[]> {
  try {
    const url = new URL(`${BASE_URL}/search-filter`)
    url.searchParams.set('q', productName)
    if (brand) url.searchParams.set('brand', brand)
    url.searchParams.set('size', '5')
    url.searchParams.set('status', '1')

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) return []

    const data: DSLDSearchResponse = await res.json()
    const hits = data.hits ?? []

    return hits.map((h) => ({
      id: h._id,
      score: h._score,
      fullName: h._source.fullName,
      brandName: h._source.brandName,
    }))
  } catch {
    return []
  }
}

export async function fetchDSLDLabel(labelId: string): Promise<DSLDLabel | null> {
  try {
    const res = await fetch(`${BASE_URL}/label/${labelId}`, {
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) return null

    return await res.json()
  } catch {
    return null
  }
}

export function transformDSLDFood(label: DSLDLabel) {
  const nutrients: Record<string, number> = {}

  for (const row of label.ingredientRows ?? []) {
    const field = INGREDIENT_MAP[row.name]
    if (!field) continue
    const qty = row.quantity?.[0]
    if (!qty || typeof qty.quantity !== 'number') continue
    // Only set if not already mapped (first match wins for variants like D2/D3)
    if (nutrients[field] == null) {
      nutrients[field] = qty.quantity
    }
  }

  const servingSize = label.servingSizes?.[0]
  const serving = servingSize
    ? `${servingSize.minQuantity} ${servingSize.unit}`.trim()
    : '1 serving'

  return {
    name: label.fullName,
    brand: label.brandName || null,
    serving_size: serving,
    serving_size_grams: null as number | null,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: null as number | null,
    sugar: null as number | null,
    sodium: nutrients.sodium != null ? Math.round(nutrients.sodium) : null,
    saturated_fat: null as number | null,
    trans_fat: null as number | null,
    cholesterol: null as number | null,
    potassium: nutrients.potassium != null ? Math.round(nutrients.potassium) : null,
    vitamin_d: nutrients.vitamin_d != null ? round1(nutrients.vitamin_d) : null,
    calcium: nutrients.calcium != null ? Math.round(nutrients.calcium) : null,
    iron: nutrients.iron != null ? round1(nutrients.iron) : null,
    vitamin_a: nutrients.vitamin_a != null ? round1(nutrients.vitamin_a) : null,
    vitamin_c: nutrients.vitamin_c != null ? round1(nutrients.vitamin_c) : null,
    vitamin_e: nutrients.vitamin_e != null ? round1(nutrients.vitamin_e) : null,
    vitamin_k: nutrients.vitamin_k != null ? round1(nutrients.vitamin_k) : null,
    thiamin: nutrients.thiamin != null ? round1(nutrients.thiamin) : null,
    riboflavin: nutrients.riboflavin != null ? round1(nutrients.riboflavin) : null,
    niacin: nutrients.niacin != null ? round1(nutrients.niacin) : null,
    vitamin_b6: nutrients.vitamin_b6 != null ? round1(nutrients.vitamin_b6) : null,
    folate: nutrients.folate != null ? round1(nutrients.folate) : null,
    vitamin_b12: nutrients.vitamin_b12 != null ? round1(nutrients.vitamin_b12) : null,
    choline: nutrients.choline != null ? round1(nutrients.choline) : null,
    magnesium: nutrients.magnesium != null ? Math.round(nutrients.magnesium) : null,
    phosphorus: nutrients.phosphorus != null ? Math.round(nutrients.phosphorus) : null,
    zinc: nutrients.zinc != null ? round1(nutrients.zinc) : null,
    copper: nutrients.copper != null ? round1(nutrients.copper) : null,
    selenium: nutrients.selenium != null ? round1(nutrients.selenium) : null,
    manganese: nutrients.manganese != null ? round1(nutrients.manganese) : null,
    source: 'dsld' as const,
    category: 'supplement' as const,
    user_id: null,
  }
}
