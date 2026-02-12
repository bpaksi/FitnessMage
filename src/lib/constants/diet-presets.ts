import type { MacroGoals } from '@/lib/types/settings'
import type { MacroRatio } from '@/lib/types/calculator'

export interface DietPreset {
  id: string
  name: string
  philosophy: string
  goals: MacroGoals
  ratio: MacroRatio
}

export const DIET_PRESETS: DietPreset[] = [
  {
    id: 'keto',
    name: 'Keto',
    philosophy:
      'Forces the body into ketosis by drastically limiting carbs, burning fat as the primary fuel source',
    goals: { calories: 2000, protein: 125, carbs: 25, fat: 155, water: 8 },
    ratio: { protein: 0.25, carbs: 0.05, fat: 0.70 },
  },
  {
    id: 'paleo',
    name: 'Paleo',
    philosophy:
      'Mimics ancestral eating patterns\u2014whole foods, no processed grains or sugars, emphasizing protein and healthy fats',
    goals: { calories: 2000, protein: 150, carbs: 100, fat: 100, water: 8 },
    ratio: { protein: 0.30, carbs: 0.22, fat: 0.48 },
  },
  {
    id: 'low-carb',
    name: 'Low Carb',
    philosophy:
      'Reduces carbohydrate intake to stabilize blood sugar and promote fat utilization without full ketosis',
    goals: { calories: 2000, protein: 150, carbs: 75, fat: 110, water: 8 },
    ratio: { protein: 0.32, carbs: 0.16, fat: 0.52 },
  },
  {
    id: 'high-protein',
    name: 'High Protein',
    philosophy:
      'Maximizes muscle protein synthesis and recovery, ideal for strength training and body recomposition',
    goals: { calories: 2200, protein: 220, carbs: 165, fat: 65, water: 8 },
    ratio: { protein: 0.40, carbs: 0.30, fat: 0.30 },
  },
  {
    id: 'balanced',
    name: 'Balanced',
    philosophy:
      'Even macro distribution following general dietary guidelines, suitable for most activity levels',
    goals: { calories: 2000, protein: 150, carbs: 200, fat: 65, water: 8 },
    ratio: { protein: 0.30, carbs: 0.40, fat: 0.30 },
  },
  {
    id: 'zone',
    name: 'Zone 40/30/30',
    philosophy:
      'Balances hormonal response by maintaining a 40% carb, 30% protein, 30% fat ratio each meal',
    goals: { calories: 2000, protein: 150, carbs: 200, fat: 67, water: 8 },
    ratio: { protein: 0.30, carbs: 0.40, fat: 0.30 },
  },
]
