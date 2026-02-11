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
}

export interface FoodFavorite {
  id: string
  user_id: string
  food_id: string
  created_at: string
}
