import type { BiologicalSex, MacroRatio } from '@/lib/types/calculator'
import type { MacroGoals } from '@/lib/types/settings'
import type { Units } from '@/lib/types/settings'

const CALORIES_PER_GRAM_PROTEIN = 4
const CALORIES_PER_GRAM_CARBS = 4
const CALORIES_PER_GRAM_FAT = 9

export function toLbs(weight: number, units: Units): number {
  return units === 'imperial' ? weight : Math.round(weight * 2.20462)
}

export function estimateCalories(weightLbs: number, sex: BiologicalSex): number {
  const multiplier = sex === 'male' ? 15 : 13
  return Math.round(weightLbs * multiplier)
}

export function distributeCalories(calories: number, ratio: MacroRatio): MacroGoals {
  return {
    calories,
    protein: Math.round((calories * ratio.protein) / CALORIES_PER_GRAM_PROTEIN),
    carbs: Math.round((calories * ratio.carbs) / CALORIES_PER_GRAM_CARBS),
    fat: Math.round((calories * ratio.fat) / CALORIES_PER_GRAM_FAT),
    water: 8,
  }
}

export function calculatePersonalizedGoals(
  weight: number,
  units: Units,
  sex: BiologicalSex,
  ratio: MacroRatio
): MacroGoals {
  const weightLbs = toLbs(weight, units)
  const calories = estimateCalories(weightLbs, sex)
  return distributeCalories(calories, ratio)
}
