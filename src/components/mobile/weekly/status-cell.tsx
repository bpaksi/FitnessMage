'use client'

interface StatusCellProps {
  value: number | null
  goal: number
  isToday: boolean
  isFuture: boolean
  color: string
}

export function StatusCell({ value, goal, isToday, isFuture, color }: StatusCellProps) {
  if (isFuture || value === null) {
    return (
      <span className="text-xs text-[#334155]">
        {isFuture ? '○' : '○'}
      </span>
    )
  }

  if (isToday && value > 0) {
    return (
      <span className="text-xs" style={{ color }}>
        •
      </span>
    )
  }

  const percentage = goal > 0 ? value / goal : 0
  const met = percentage >= 0.9

  return (
    <span className={`text-xs font-medium ${met ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
      {met ? '✓' : '✗'}
    </span>
  )
}
