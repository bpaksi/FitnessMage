export interface NutrientInfo {
  key: string
  label: string
  unit: string
  dailyValue: number
  color: string
  category: 'macro' | 'vitamin' | 'mineral' | 'fat' | 'other'
}

export const NUTRIENT_INFO: Record<string, NutrientInfo> = {
  // Macros
  calories: { key: 'calories', label: 'Calories', unit: 'kcal', dailyValue: 2000, color: '#22c55e', category: 'macro' },
  protein: { key: 'protein', label: 'Protein', unit: 'g', dailyValue: 50, color: '#ef4444', category: 'macro' },
  carbs: { key: 'carbs', label: 'Carbohydrates', unit: 'g', dailyValue: 275, color: '#3b82f6', category: 'macro' },
  fat: { key: 'fat', label: 'Total Fat', unit: 'g', dailyValue: 78, color: '#eab308', category: 'macro' },
  fiber: { key: 'fiber', label: 'Fiber', unit: 'g', dailyValue: 28, color: '#a3e635', category: 'macro' },
  sugar: { key: 'sugar', label: 'Sugar', unit: 'g', dailyValue: 50, color: '#f472b6', category: 'macro' },
  sodium: { key: 'sodium', label: 'Sodium', unit: 'mg', dailyValue: 2300, color: '#94a3b8', category: 'mineral' },

  // Fats
  saturated_fat: { key: 'saturated_fat', label: 'Saturated Fat', unit: 'g', dailyValue: 20, color: '#f59e0b', category: 'fat' },
  trans_fat: { key: 'trans_fat', label: 'Trans Fat', unit: 'g', dailyValue: 0, color: '#fb923c', category: 'fat' },
  monounsaturated_fat: { key: 'monounsaturated_fat', label: 'Monounsaturated Fat', unit: 'g', dailyValue: 20, color: '#fbbf24', category: 'fat' },
  polyunsaturated_fat: { key: 'polyunsaturated_fat', label: 'Polyunsaturated Fat', unit: 'g', dailyValue: 22, color: '#f9a825', category: 'fat' },
  cholesterol: { key: 'cholesterol', label: 'Cholesterol', unit: 'mg', dailyValue: 300, color: '#e879f9', category: 'fat' },

  // Vitamins
  vitamin_a: { key: 'vitamin_a', label: 'Vitamin A', unit: 'mcg', dailyValue: 900, color: '#fb923c', category: 'vitamin' },
  vitamin_c: { key: 'vitamin_c', label: 'Vitamin C', unit: 'mg', dailyValue: 90, color: '#facc15', category: 'vitamin' },
  vitamin_d: { key: 'vitamin_d', label: 'Vitamin D', unit: 'mcg', dailyValue: 20, color: '#fde047', category: 'vitamin' },
  vitamin_e: { key: 'vitamin_e', label: 'Vitamin E', unit: 'mg', dailyValue: 15, color: '#a3e635', category: 'vitamin' },
  vitamin_k: { key: 'vitamin_k', label: 'Vitamin K', unit: 'mcg', dailyValue: 120, color: '#4ade80', category: 'vitamin' },
  thiamin: { key: 'thiamin', label: 'Thiamin (B1)', unit: 'mg', dailyValue: 1.2, color: '#2dd4bf', category: 'vitamin' },
  riboflavin: { key: 'riboflavin', label: 'Riboflavin (B2)', unit: 'mg', dailyValue: 1.3, color: '#22d3ee', category: 'vitamin' },
  niacin: { key: 'niacin', label: 'Niacin (B3)', unit: 'mg', dailyValue: 16, color: '#38bdf8', category: 'vitamin' },
  vitamin_b6: { key: 'vitamin_b6', label: 'Vitamin B6', unit: 'mg', dailyValue: 1.7, color: '#60a5fa', category: 'vitamin' },
  folate: { key: 'folate', label: 'Folate', unit: 'mcg', dailyValue: 400, color: '#818cf8', category: 'vitamin' },
  vitamin_b12: { key: 'vitamin_b12', label: 'Vitamin B12', unit: 'mcg', dailyValue: 2.4, color: '#a78bfa', category: 'vitamin' },
  choline: { key: 'choline', label: 'Choline', unit: 'mg', dailyValue: 550, color: '#c084fc', category: 'vitamin' },
  retinol: { key: 'retinol', label: 'Retinol', unit: 'mcg', dailyValue: 900, color: '#e879f9', category: 'vitamin' },

  // Minerals
  calcium: { key: 'calcium', label: 'Calcium', unit: 'mg', dailyValue: 1300, color: '#f0f0f0', category: 'mineral' },
  iron: { key: 'iron', label: 'Iron', unit: 'mg', dailyValue: 18, color: '#b91c1c', category: 'mineral' },
  potassium: { key: 'potassium', label: 'Potassium', unit: 'mg', dailyValue: 4700, color: '#7c3aed', category: 'mineral' },
  magnesium: { key: 'magnesium', label: 'Magnesium', unit: 'mg', dailyValue: 420, color: '#06b6d4', category: 'mineral' },
  phosphorus: { key: 'phosphorus', label: 'Phosphorus', unit: 'mg', dailyValue: 1250, color: '#14b8a6', category: 'mineral' },
  zinc: { key: 'zinc', label: 'Zinc', unit: 'mg', dailyValue: 11, color: '#64748b', category: 'mineral' },
  copper: { key: 'copper', label: 'Copper', unit: 'mg', dailyValue: 0.9, color: '#d97706', category: 'mineral' },
  selenium: { key: 'selenium', label: 'Selenium', unit: 'mcg', dailyValue: 55, color: '#65a30d', category: 'mineral' },
  manganese: { key: 'manganese', label: 'Manganese', unit: 'mg', dailyValue: 2.3, color: '#9333ea', category: 'mineral' },

  // Other
  caffeine: { key: 'caffeine', label: 'Caffeine', unit: 'mg', dailyValue: 400, color: '#78350f', category: 'other' },
  alcohol: { key: 'alcohol', label: 'Alcohol', unit: 'g', dailyValue: 0, color: '#991b1b', category: 'other' },
  water_content: { key: 'water_content', label: 'Water', unit: 'g', dailyValue: 3700, color: '#0ea5e9', category: 'other' },
}

export const EXPANDED_NUTRIENT_KEYS = [
  'vitamin_a', 'vitamin_c', 'vitamin_e', 'vitamin_k',
  'thiamin', 'riboflavin', 'niacin', 'vitamin_b6',
  'folate', 'vitamin_b12', 'choline', 'retinol',
  'magnesium', 'phosphorus', 'zinc', 'copper',
  'selenium', 'manganese',
  'monounsaturated_fat', 'polyunsaturated_fat',
  'caffeine', 'alcohol', 'water_content',
] as const
