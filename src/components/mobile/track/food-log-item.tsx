'use client'

import { useState } from 'react'
import type { DailyLogEntry } from '@/lib/types/log'

interface FoodLogItemProps {
  entry: DailyLogEntry
  onEditEntry: (entry: DailyLogEntry) => void
  onEditFood: (entry: DailyLogEntry) => void
  onDelete: (entry: DailyLogEntry) => void
}

export function FoodLogItem({ entry, onEditEntry, onEditFood, onDelete }: FoodLogItemProps) {
  const [expanded, setExpanded] = useState(false)

  const foodName = entry.meal
    ? entry.meal.name
    : entry.food
      ? `${entry.food.name}${entry.food.serving_size ? ` (${entry.food.serving_size})` : ''}`
      : 'Unknown food'

  return (
    <div className="border-b border-[#1e293b] last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors active:bg-[#0f172a]"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-[#f8fafc]">
            {foodName}
            {entry.servings !== 1 && (
              <span className="text-[#64748b]"> x{entry.servings}</span>
            )}
          </p>
        </div>
        <span className="ml-3 shrink-0 text-xs tabular-nums text-[#64748b]">
          {Math.round(Number(entry.calories))} cal
        </span>
      </button>

      {expanded && (
        <div className="animate-fade-in space-y-3 px-3 pb-3">
          {/* Macro breakdown */}
          <div className="grid grid-cols-4 gap-2 rounded-lg bg-[#0f172a] p-2.5">
            <div className="text-center">
              <p className="text-[10px] text-[#64748b]">Cal</p>
              <p className="text-xs font-medium text-[#22c55e]">{Math.round(Number(entry.calories))}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-[#64748b]">Protein</p>
              <p className="text-xs font-medium text-[#ef4444]">{Number(entry.protein).toFixed(1)}g</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-[#64748b]">Carbs</p>
              <p className="text-xs font-medium text-[#3b82f6]">{Number(entry.carbs).toFixed(1)}g</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-[#64748b]">Fat</p>
              <p className="text-xs font-medium text-[#eab308]">{Number(entry.fat).toFixed(1)}g</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onEditEntry(entry)}
              className="rounded-md bg-[#0f172a] px-3 py-1.5 text-xs text-[#94a3b8] transition-colors hover:bg-[#1e293b]"
            >
              Edit qty
            </button>
            <button
              onClick={() => onEditFood(entry)}
              className="rounded-md bg-[#0f172a] px-3 py-1.5 text-xs text-[#94a3b8] transition-colors hover:bg-[#1e293b]"
            >
              Edit food
            </button>
            <button
              onClick={() => onDelete(entry)}
              className="rounded-md bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/20"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
