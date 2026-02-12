interface USDANutrient {
  nutrientId: number
  value: number
}

interface USDAFood {
  fdcId: number
  description: string
  dataType: string
  brandOwner?: string
  gtinUpc?: string
  householdServingFullText?: string
  servingSize?: number
  servingSizeUnit?: string
  foodNutrients: USDANutrient[]
}

interface USDASearchResult {
  foods: USDAFood[]
  totalHits: number
}

const NUTRIENT_MAP: Record<number, string> = {
  // Macros
  1008: 'calories',
  1003: 'protein',
  1005: 'carbs',
  1004: 'fat',
  1079: 'fiber',
  2000: 'sugar',
  1093: 'sodium',
  // Fats
  1258: 'saturated_fat',
  1257: 'trans_fat',
  1253: 'cholesterol',
  1292: 'monounsaturated_fat',
  1293: 'polyunsaturated_fat',
  // Minerals
  1092: 'potassium',
  1087: 'calcium',
  1089: 'iron',
  1090: 'magnesium',
  1091: 'phosphorus',
  1095: 'zinc',
  1098: 'copper',
  1103: 'selenium',
  1101: 'manganese',
  // Vitamins
  1114: 'vitamin_d',
  1106: 'vitamin_a',
  1162: 'vitamin_c',
  1109: 'vitamin_e',
  1185: 'vitamin_k',
  1165: 'thiamin',
  1166: 'riboflavin',
  1167: 'niacin',
  1175: 'vitamin_b6',
  1177: 'folate',
  1178: 'vitamin_b12',
  1180: 'choline',
  1105: 'retinol',
  // Other
  1057: 'caffeine',
  1018: 'alcohol',
  1051: 'water_content',
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export async function searchUSDA(query: string, apiKey: string): Promise<USDAFood[]> {
  const url = new URL('https://api.nal.usda.gov/fdc/v1/foods/search')
  url.searchParams.set('query', query)
  url.searchParams.set('pageSize', '20')
  url.searchParams.set('api_key', apiKey)

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(5000),
  })

  if (!res.ok) return []

  const data: USDASearchResult = await res.json()
  return data.foods ?? []
}

export function transformUSDAFood(food: USDAFood) {
  const nutrients: Record<string, number> = {}
  for (const n of food.foodNutrients) {
    const key = NUTRIENT_MAP[n.nutrientId]
    if (key) nutrients[key] = n.value
  }

  if (
    nutrients.calories == null ||
    nutrients.protein == null ||
    nutrients.carbs == null ||
    nutrients.fat == null
  ) {
    return null
  }

  const isBranded = food.dataType === 'Branded'

  let serving_size: string
  let serving_size_grams: number | null = null

  if (isBranded) {
    if (food.householdServingFullText) {
      serving_size = food.householdServingFullText
    } else if (food.servingSize && food.servingSizeUnit) {
      serving_size = `${food.servingSize}${food.servingSizeUnit}`
    } else {
      serving_size = '1 serving'
    }
    if (food.servingSize) {
      serving_size_grams = food.servingSize
    }
  } else {
    serving_size = '100g'
    serving_size_grams = 100
  }

  return {
    name: titleCase(food.description),
    brand: food.brandOwner || null,
    barcode: food.gtinUpc || null,
    serving_size,
    serving_size_grams,
    calories: Math.round(nutrients.calories),
    protein: round1(nutrients.protein),
    carbs: round1(nutrients.carbs),
    fat: round1(nutrients.fat),
    fiber: nutrients.fiber != null ? round1(nutrients.fiber) : null,
    sugar: nutrients.sugar != null ? round1(nutrients.sugar) : null,
    sodium: nutrients.sodium != null ? Math.round(nutrients.sodium) : null,
    saturated_fat: nutrients.saturated_fat != null ? round1(nutrients.saturated_fat) : null,
    trans_fat: nutrients.trans_fat != null ? round1(nutrients.trans_fat) : null,
    cholesterol: nutrients.cholesterol != null ? round1(nutrients.cholesterol) : null,
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
    retinol: nutrients.retinol != null ? round1(nutrients.retinol) : null,
    magnesium: nutrients.magnesium != null ? Math.round(nutrients.magnesium) : null,
    phosphorus: nutrients.phosphorus != null ? Math.round(nutrients.phosphorus) : null,
    zinc: nutrients.zinc != null ? round1(nutrients.zinc) : null,
    copper: nutrients.copper != null ? round1(nutrients.copper) : null,
    selenium: nutrients.selenium != null ? round1(nutrients.selenium) : null,
    manganese: nutrients.manganese != null ? round1(nutrients.manganese) : null,
    monounsaturated_fat: nutrients.monounsaturated_fat != null ? round1(nutrients.monounsaturated_fat) : null,
    polyunsaturated_fat: nutrients.polyunsaturated_fat != null ? round1(nutrients.polyunsaturated_fat) : null,
    caffeine: nutrients.caffeine != null ? round1(nutrients.caffeine) : null,
    alcohol: nutrients.alcohol != null ? round1(nutrients.alcohol) : null,
    water_content: nutrients.water_content != null ? round1(nutrients.water_content) : null,
    source: 'usda' as const,
    user_id: null,
  }
}
