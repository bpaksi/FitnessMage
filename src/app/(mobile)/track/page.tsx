'use client'

import { useState, useCallback } from 'react'
import { Copy, Droplets } from 'lucide-react'
import { toast } from 'sonner'
import { useMobileContext } from '@/contexts/mobile-context'
import { useDailyLog } from '@/hooks/use-daily-log'
import { useFavorites } from '@/hooks/use-favorites'
import { useDailySummary } from '@/hooks/use-daily-summary'
import { apiClient } from '@/lib/mobile/api-client'
import { BottomNav } from '@/components/mobile/bottom-nav'
import { DatePicker } from '@/components/mobile/date-picker'
import { MealGroup } from '@/components/mobile/track/meal-group'
import { FoodLogItem } from '@/components/mobile/track/food-log-item'
import { EditEntrySheet } from '@/components/mobile/track/edit-entry-sheet'
import { MoveMealSheet } from '@/components/mobile/track/move-meal-sheet'
import { CopyMealSheet } from '@/components/mobile/track/copy-meal-sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { DailyLogEntry, MealType } from '@/lib/types/log'

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

function vibrate() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
}

export default function TrackPage() {
  const { selectedDate } = useMobileContext()
  const { entries, isLoading, mutate: mutateLog } = useDailyLog(selectedDate)
  const { mutate: mutateSummary } = useDailySummary(selectedDate)
  const { favorites, toggleFavorite } = useFavorites()

  const [editingEntry, setEditingEntry] = useState<DailyLogEntry | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<DailyLogEntry | null>(null)
  const [movingEntry, setMovingEntry] = useState<DailyLogEntry | null>(null)
  const [copyOpen, setCopyOpen] = useState(false)

  const groupedEntries = MEAL_ORDER.reduce(
    (acc, meal) => {
      acc[meal] = entries.filter((e) => e.meal_type === meal)
      return acc
    },
    {} as Record<MealType, DailyLogEntry[]>,
  )

  const handleEditSave = useCallback(
    async (id: string, servings: number, mealType: MealType) => {
      vibrate()
      // Optimistic
      mutateLog(
        entries.map((e) => (e.id === id ? { ...e, servings, meal_type: mealType } : e)),
        false,
      )
      setEditingEntry(null)

      await apiClient(`/api/log/${id}`, {
        method: 'PATCH',
        body: { servings, meal_type: mealType },
      })
      mutateLog()
      mutateSummary()
    },
    [entries, mutateLog, mutateSummary],
  )

  const handleMove = useCallback(
    async (id: string, targetMealType: MealType) => {
      vibrate()
      setMovingEntry(null)

      const MEAL_LABELS: Record<MealType, string> = {
        breakfast: 'Breakfast',
        lunch: 'Lunch',
        dinner: 'Dinner',
        snack: 'Snack',
      }

      // Optimistic
      mutateLog(
        entries.map((e) => (e.id === id ? { ...e, meal_type: targetMealType } : e)),
        false,
      )

      await apiClient(`/api/log/${id}`, {
        method: 'PATCH',
        body: { meal_type: targetMealType },
      })
      mutateLog()
      mutateSummary()
      toast.success(`Moved to ${MEAL_LABELS[targetMealType]}`)
    },
    [entries, mutateLog, mutateSummary],
  )

  const handleDelete = useCallback(
    async (entry: DailyLogEntry) => {
      vibrate()
      setDeletingEntry(null)

      // Optimistic remove
      mutateLog(
        entries.filter((e) => e.id !== entry.id),
        false,
      )

      await apiClient(`/api/log/${entry.id}`, { method: 'DELETE' })
      toast(`Removed ${entry.food?.name || 'entry'}`, {
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: async () => {
            // Re-add the entry
            if (entry.food_id) {
              await apiClient('/api/log', {
                method: 'POST',
                body: {
                  food_id: entry.food_id,
                  date: selectedDate,
                  meal_type: entry.meal_type,
                  servings: entry.servings,
                },
              })
            }
            mutateLog()
            mutateSummary()
          },
        },
      })
      mutateSummary()
    },
    [entries, selectedDate, mutateLog, mutateSummary],
  )

  const handleCopyMeal = useCallback(
    async (sourceDate: string, sourceMealType: MealType, targetMealType: MealType) => {
      vibrate()
      setCopyOpen(false)

      await apiClient('/api/log/copy', {
        method: 'POST',
        body: {
          sourceDate,
          sourceMealType,
          targetDate: selectedDate,
          targetMealType,
        },
      })

      mutateLog()
      mutateSummary()
      toast.success('Meal copied')
    },
    [selectedDate, mutateLog, mutateSummary],
  )

  const handleAddWater = useCallback(async () => {
    vibrate()

    // Optimistic: add a placeholder water entry
    const optimisticEntry: DailyLogEntry = {
      id: `temp-water-${Date.now()}`,
      user_id: '',
      date: selectedDate,
      food_id: 'water',
      meal_id: null,
      meal_type: 'snack',
      servings: 1,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      logged_at: new Date().toISOString(),
      food: { id: 'water', name: 'Water', serving_size: '8 oz', brand: null },
    }
    mutateLog([...entries, optimisticEntry], false)

    await apiClient('/api/log/water', {
      method: 'POST',
      body: { date: selectedDate },
    })
    mutateLog()
    mutateSummary()
    toast.success('Water logged')
  }, [selectedDate, entries, mutateLog, mutateSummary])

  return (
    <div className="flex min-h-svh flex-col pb-20">
      <header
        className="space-y-3 px-4 pt-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-[#f8fafc]">Track</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddWater}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-[#38bdf8] transition-colors active:bg-[#0f172a]"
            >
              <Droplets size={14} />
              <span>+ Water</span>
            </button>
            <button
              onClick={() => setCopyOpen(true)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-[#3b82f6] transition-colors active:bg-[#0f172a]"
            >
              <Copy size={14} />
              <span>Copy from</span>
            </button>
          </div>
        </div>
        <DatePicker />
      </header>

      <main className="flex-1 px-4 pt-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-[#0f172a]" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {MEAL_ORDER.map((meal) => (
              <MealGroup
                key={meal}
                mealType={meal}
                entries={groupedEntries[meal]}
              >
                {groupedEntries[meal].map((entry) => (
                  <FoodLogItem
                    key={entry.id}
                    entry={entry}
                    isFavorite={entry.food_id ? favorites.some((f) => f.id === entry.food_id) : false}
                    onEditEntry={setEditingEntry}
                    onToggleFavorite={(e) => e.food_id && toggleFavorite(e.food_id, favorites.some((f) => f.id === e.food_id))}
                    onMove={setMovingEntry}
                    onDelete={setDeletingEntry}
                  />
                ))}
              </MealGroup>
            ))}
          </div>
        )}
      </main>

      {/* Sheets */}
      <EditEntrySheet
        entry={editingEntry}
        open={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={handleEditSave}
      />

      <MoveMealSheet
        entry={movingEntry}
        open={!!movingEntry}
        onClose={() => setMovingEntry(null)}
        onMove={handleMove}
      />

      <CopyMealSheet
        targetDate={selectedDate}
        open={copyOpen}
        onClose={() => setCopyOpen(false)}
        onCopy={handleCopyMeal}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingEntry} onOpenChange={(o) => !o && setDeletingEntry(null)}>
        <AlertDialogContent className="border-[#1e293b] bg-[#0f172a]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#f8fafc]">Delete entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#64748b]">
              Remove {deletingEntry?.food?.name || 'this entry'} from your log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#1e293b] text-[#94a3b8]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingEntry && handleDelete(deletingEntry)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  )
}
