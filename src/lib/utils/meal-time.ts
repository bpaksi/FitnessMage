import type { MealType } from '@/lib/types/log'
import type { MealTimeBoundaries } from '@/lib/types/settings'

const DEFAULT_BOUNDARIES: MealTimeBoundaries = {
  breakfast: { start: '06:00', end: '10:00' },
  lunch: { start: '11:00', end: '14:00' },
  dinner: { start: '17:00', end: '21:00' },
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function getMealTypeForTime(
  time: string = new Date().toTimeString().slice(0, 5),
  boundaries: MealTimeBoundaries = DEFAULT_BOUNDARIES,
): MealType {
  const minutes = timeToMinutes(time)

  if (
    minutes >= timeToMinutes(boundaries.breakfast.start) &&
    minutes < timeToMinutes(boundaries.breakfast.end)
  ) {
    return 'breakfast'
  }
  if (
    minutes >= timeToMinutes(boundaries.lunch.start) &&
    minutes < timeToMinutes(boundaries.lunch.end)
  ) {
    return 'lunch'
  }
  if (
    minutes >= timeToMinutes(boundaries.dinner.start) &&
    minutes < timeToMinutes(boundaries.dinner.end)
  ) {
    return 'dinner'
  }
  return 'snack'
}
