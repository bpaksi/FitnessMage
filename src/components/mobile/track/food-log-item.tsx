'use client'

import { useState, useRef, useCallback } from 'react'
import { ArrowRightLeft, Star, Trash2 } from 'lucide-react'
import type { DailyLogEntry } from '@/lib/types/log'

interface FoodLogItemProps {
  entry: DailyLogEntry
  isFavorite: boolean
  onEditEntry: (entry: DailyLogEntry) => void
  onEditFood: (entry: DailyLogEntry) => void
  onToggleFavorite: (entry: DailyLogEntry) => void
  onMove: (entry: DailyLogEntry) => void
  onDelete: (entry: DailyLogEntry) => void
}

const ACTION_ZONE_WIDTH = 144
const SNAP_THRESHOLD_PX = 72

function vibrate() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
}

export function FoodLogItem({ entry, isFavorite, onEditEntry, onEditFood, onToggleFavorite, onMove, onDelete }: FoodLogItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [offsetX, setOffsetX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [settled, setSettled] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const currentX = useRef(0)
  const isTracking = useRef(false)
  const directionLocked = useRef<'horizontal' | 'vertical' | null>(null)
  const [reducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  // Reset swipe when item is deleted/changes
  const [prevEntryId, setPrevEntryId] = useState(entry.id)
  if (prevEntryId !== entry.id) {
    setPrevEntryId(entry.id)
    setOffsetX(0)
    setSettled(false)
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (settled) {
      // If already showing delete zone, reset on new touch
      setSettled(false)
      setOffsetX(0)
      return
    }
    const touch = e.touches[0]
    startX.current = touch.clientX
    startY.current = touch.clientY
    currentX.current = 0
    isTracking.current = true
    directionLocked.current = null
    setSwiping(true)
  }, [settled])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isTracking.current) return
    const touch = e.touches[0]
    const dx = touch.clientX - startX.current
    const dy = touch.clientY - startY.current

    // Lock direction after 10px of movement
    if (!directionLocked.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      directionLocked.current = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'
    }

    if (directionLocked.current === 'vertical') {
      isTracking.current = false
      setSwiping(false)
      setOffsetX(0)
      return
    }

    if (directionLocked.current === 'horizontal') {
      // Only allow swipe left (negative dx)
      const clampedDx = Math.min(0, dx)
      currentX.current = clampedDx
      setOffsetX(clampedDx)

      // Clamp max swipe to action zone width
      const maxSwipe = ACTION_ZONE_WIDTH + 20
      if (Math.abs(clampedDx) > maxSwipe) {
        currentX.current = -maxSwipe
        setOffsetX(-maxSwipe)
      }
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!isTracking.current && !swiping) return
    isTracking.current = false
    setSwiping(false)

    if (Math.abs(currentX.current) >= SNAP_THRESHOLD_PX) {
      // Settle to show action zones
      setOffsetX(-ACTION_ZONE_WIDTH)
      setSettled(true)
    } else {
      // Snap back
      setOffsetX(0)
    }
  }, [swiping])

  const handleMoveClick = useCallback(() => {
    vibrate()
    setSettled(false)
    setOffsetX(0)
    onMove(entry)
  }, [entry, onMove])

  const handleDeleteClick = useCallback(() => {
    vibrate()
    onDelete(entry)
  }, [entry, onDelete])

  const foodName = entry.meal
    ? entry.meal.name
    : entry.food
      ? `${entry.food.name}${entry.food.serving_size ? ` (${entry.food.serving_size})` : ''}`
      : 'Unknown food'

  const transitionClass = swiping
    ? ''
    : reducedMotion
      ? ''
      : 'transition-transform duration-300 ease-out'

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden border-b border-[#1e293b] last:border-b-0"
    >
      {/* Action zones behind */}
      <div className="absolute inset-y-0 right-0 flex w-[144px]">
        <button
          onClick={handleMoveClick}
          className="flex h-full w-[72px] items-center justify-center bg-[#3b82f6]"
          aria-label="Move to another meal"
        >
          <ArrowRightLeft size={20} className="text-white" />
        </button>
        <button
          onClick={handleDeleteClick}
          className="flex h-full w-[72px] items-center justify-center bg-red-600"
          aria-label="Delete entry"
        >
          <Trash2 size={20} className="text-white" />
        </button>
      </div>

      {/* Swipeable foreground */}
      <div
        className={`relative bg-[#020817] ${transitionClass}`}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={() => {
            if (settled) {
              setSettled(false)
              setOffsetX(0)
              return
            }
            if (Math.abs(offsetX) < 5) setExpanded(!expanded)
          }}
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

            {/* Actions — no delete here, it's swipe-accessible */}
            <div className="flex items-center gap-2">
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
              {entry.food_id && (
                <button
                  onClick={() => {
                    vibrate()
                    onToggleFavorite(entry)
                  }}
                  className="ml-auto rounded-md bg-[#0f172a] p-1.5 transition-colors hover:bg-[#1e293b]"
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star size={16} className={isFavorite ? 'fill-amber-400 text-amber-400' : 'text-[#64748b]'} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
