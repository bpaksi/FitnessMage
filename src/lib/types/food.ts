export interface Food {
  id: string
  barcode: string | null
  name: string
  brand: string | null
  serving_size: string | null
  serving_size_grams: number | null
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number | null
  sugar: number | null
  sodium: number | null
  saturated_fat: number | null
  trans_fat: number | null
  cholesterol: number | null
  potassium: number | null
  vitamin_d: number | null
  calcium: number | null
  iron: number | null
  category: 'food' | 'supplement'
  vitamin_a: number | null
  vitamin_c: number | null
  vitamin_e: number | null
  vitamin_k: number | null
  thiamin: number | null
  riboflavin: number | null
  niacin: number | null
  vitamin_b6: number | null
  folate: number | null
  vitamin_b12: number | null
  choline: number | null
  retinol: number | null
  magnesium: number | null
  phosphorus: number | null
  zinc: number | null
  copper: number | null
  selenium: number | null
  manganese: number | null
  monounsaturated_fat: number | null
  polyunsaturated_fat: number | null
  caffeine: number | null
  alcohol: number | null
  water_content: number | null
  source: 'openfoodfacts' | 'usda' | 'manual'
  user_id: string | null
  created_at: string
  updated_at: string
}

export interface FoodServingUnit {
  id: string
  food_id: string
  label: string
  grams: number
  is_default: boolean
}

export interface FoodWithServingUnits extends Food {
  serving_units: FoodServingUnit[]
}

export interface CreateFoodInput {
  name: string
  brand?: string
  serving_size: string
  calories: number
  protein: number
  carbs: number
  fat: number
  barcode?: string
  fiber?: number
  sugar?: number
  sodium?: number
  saturated_fat?: number
  trans_fat?: number
  cholesterol?: number
  potassium?: number
  vitamin_d?: number
  calcium?: number
  iron?: number
  category?: 'food' | 'supplement'
  vitamin_a?: number
  vitamin_c?: number
  vitamin_e?: number
  vitamin_k?: number
  thiamin?: number
  riboflavin?: number
  niacin?: number
  vitamin_b6?: number
  folate?: number
  vitamin_b12?: number
  choline?: number
  retinol?: number
  magnesium?: number
  phosphorus?: number
  zinc?: number
  copper?: number
  selenium?: number
  manganese?: number
  monounsaturated_fat?: number
  polyunsaturated_fat?: number
  caffeine?: number
  alcohol?: number
  water_content?: number
}

export interface FoodFavorite {
  id: string
  user_id: string
  food_id: string
  created_at: string
}
