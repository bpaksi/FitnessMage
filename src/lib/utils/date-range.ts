import type { ReportRange } from '@/lib/types/report'

export const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

export function getDateRange(range: ReportRange, weekStartDay: string): { start: string; end: string } {
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  if (range === 'last_30_days') {
    const start = new Date(today)
    start.setDate(today.getDate() - 29)
    return {
      start: start.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    }
  }

  if (range === 'this_month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    return {
      start: start.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    }
  }

  // Week calculations
  const dayOfWeek = today.getDay()
  const startDayNum = DAY_MAP[weekStartDay] ?? 1

  let diff = dayOfWeek - startDayNum
  if (diff < 0) diff += 7

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - diff)

  if (range === 'last_week') {
    weekStart.setDate(weekStart.getDate() - 7)
  }

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  return {
    start: weekStart.toISOString().split('T')[0],
    end: weekEnd.toISOString().split('T')[0],
  }
}
