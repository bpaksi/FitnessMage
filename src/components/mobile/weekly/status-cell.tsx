'use client'

import { Circle, Check, X } from 'lucide-react'

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
      <span className="flex items-center justify-center text-[#334155]">
        <Circle size={10} />
      </span>
    )
  }

  if (isToday && value > 0) {
    return (
      <span className="flex items-center justify-center" style={{ color }}>
        <Circle size={10} className="fill-current" />
      </span>
    )
  }

  const percentage = goal > 0 ? value / goal : 0
  const met = percentage >= 0.9

  return (
    <span className={`flex items-center justify-center ${met ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
      {met ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
    </span>
  )
}
