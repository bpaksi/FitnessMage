'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useMobileContext } from '@/contexts/mobile-context'
import { useDailySummary } from '@/hooks/use-daily-summary'
import { useDailyLog } from '@/hooks/use-daily-log'
import { apiClient } from '@/lib/mobile/api-client'
import { getMealTypeForTime } from '@/lib/utils/meal-time'
import { toast } from 'sonner'
import { showUndoToast } from '@/components/mobile/undo-toast'
import { BottomNav } from '@/components/mobile/bottom-nav'
import { SavedTab } from '@/components/mobile/add/saved-tab'
import { RecentTab } from '@/components/mobile/add/recent-tab'
import { SearchTab } from '@/components/mobile/add/search-tab'
import { ScanTab } from '@/components/mobile/add/scan-tab'
import { ManualTab } from '@/components/mobile/add/manual-tab'
import { QuantityPicker } from '@/components/mobile/add/quantity-picker'
import { MealServingsPicker } from '@/components/mobile/add/meal-servings-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Food } from '@/lib/types/food'
import type { Meal } from '@/lib/types/meal'
import type { MealType, DailyLogEntry } from '@/lib/types/log'

function vibrate() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(50)
  }
}

export default function AddPage() {
  const router = useRouter()
  const { selectedDate, userSettings } = useMobileContext()
  const { mutate } = useDailySummary(selectedDate)
  const { mutate: mutateLog } = useDailyLog(selectedDate)
  const [activeTab, setActiveTab] = useState('recent')
  const [mealType, setMealType] = useState<MealType>(() =>
    getMealTypeForTime(undefined, userSettings?.meal_time_boundaries),
  )
  const [quantityFood, setQuantityFood] = useState<Food | null>(null)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [manualBarcode, setManualBarcode] = useState<string | undefined>()
  const [manualLoading, setManualLoading] = useState(false)

  const addFoodToLog = useCallback(
    async (food: Food, servings = 1) => {
      vibrate()

      // Optimistic update
      const optimisticEntry = {
        id: `temp-${Date.now()}`,
        user_id: '',
        date: selectedDate,
        food_id: food.id,
        meal_id: null,
        meal_type: mealType,
        servings,
        calories: food.calories * servings,
        protein: food.protein * servings,
        carbs: food.carbs * servings,
        fat: food.fat * servings,
        logged_at: new Date().toISOString(),
        food: { id: food.id, name: food.name, serving_size: food.serving_size, brand: food.brand },
      }

      mutate(
        (current) =>
          current
            ? {
                ...current,
                entries: [...current.entries, optimisticEntry as DailyLogEntry],
                totals: {
                  ...current.totals,
                  calories: current.totals.calories + optimisticEntry.calories,
                  protein: current.totals.protein + optimisticEntry.protein,
                  carbs: current.totals.carbs + optimisticEntry.carbs,
                  fat: current.totals.fat + optimisticEntry.fat,
                },
              }
            : undefined,
        false,
      )

      try {
        const entry = await apiClient<DailyLogEntry>('/api/log', {
          method: 'POST',
          body: { food_id: food.id, date: selectedDate, meal_type: mealType, servings },
        })

        mutateLog()
        showUndoToast(entry.id, food.name, () => { mutate(); mutateLog() })
        router.push('/track')
      } catch {
        // Revert on error
        mutate()
      }
    },
    [selectedDate, mealType, mutate, mutateLog, router],
  )

  const addMealToLog = useCallback(
    async (meal: Meal, servings: number) => {
      vibrate()

      // Calculate preview macros for optimistic update
      const ts = meal.total_servings || 1
      const mealTotals = meal.foods.reduce(
        (acc, mf) => ({
          calories: acc.calories + mf.food.calories * mf.servings,
          protein: acc.protein + mf.food.protein * mf.servings,
          carbs: acc.carbs + mf.food.carbs * mf.servings,
          fat: acc.fat + mf.food.fat * mf.servings,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      )
      const macros = {
        calories: Math.round((mealTotals.calories / ts) * servings),
        protein: Math.round((mealTotals.protein / ts) * servings * 10) / 10,
        carbs: Math.round((mealTotals.carbs / ts) * servings * 10) / 10,
        fat: Math.round((mealTotals.fat / ts) * servings * 10) / 10,
      }

      const optimisticEntry = {
        id: `temp-${Date.now()}`,
        user_id: '',
        date: selectedDate,
        food_id: null,
        meal_id: meal.id,
        meal_type: mealType,
        servings,
        ...macros,
        logged_at: new Date().toISOString(),
        meal: { id: meal.id, name: meal.name, total_servings: meal.total_servings },
      }

      mutate(
        (current) =>
          current
            ? {
                ...current,
                entries: [...current.entries, optimisticEntry as DailyLogEntry],
                totals: {
                  ...current.totals,
                  calories: current.totals.calories + macros.calories,
                  protein: current.totals.protein + macros.protein,
                  carbs: current.totals.carbs + macros.carbs,
                  fat: current.totals.fat + macros.fat,
                },
              }
            : undefined,
        false,
      )

      try {
        const entry = await apiClient<DailyLogEntry>('/api/log', {
          method: 'POST',
          body: { meal_id: meal.id, date: selectedDate, meal_type: mealType, servings },
        })

        mutateLog()
        showUndoToast(entry.id, meal.name, () => { mutate(); mutateLog() })
        router.push('/track')
      } catch {
        mutate()
      }
    },
    [selectedDate, mealType, mutate, mutateLog, router],
  )

  async function handleManualSubmit(values: {
    name: string
    brand?: string
    serving_size: string
    calories: number
    protein: number
    carbs: number
    fat: number
    barcode?: string
    fiber?: number
    sugar?: number
    sodium?: number
    saturated_fat?: number
    trans_fat?: number
    cholesterol?: number
    potassium?: number
    vitamin_d?: number
    calcium?: number
    iron?: number
  }) {
    setManualLoading(true)
    try {
      const food = await apiClient<Food>('/api/foods', {
        method: 'POST',
        body: values,
      })
      await addFoodToLog(food)
    } catch {
      toast.error('Failed to create food')
    } finally {
      setManualLoading(false)
    }
  }

  return (
    <div className="flex h-svh flex-col">
      {activeTab !== 'scan' && (
        <header
          className="shrink-0 space-y-3 px-4 pt-4"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
        >
          <h1 className="text-lg font-medium text-[#f8fafc]">Add Food</h1>
          <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
            <SelectTrigger className="w-full border-[#1e293b] bg-[#0f172a] text-[#f8fafc]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" className="border-[#1e293b] bg-[#0f172a]">
              <SelectItem value="breakfast" className="text-[#f8fafc]">Breakfast</SelectItem>
              <SelectItem value="lunch" className="text-[#f8fafc]">Lunch</SelectItem>
              <SelectItem value="dinner" className="text-[#f8fafc]">Dinner</SelectItem>
              <SelectItem value="snack" className="text-[#f8fafc]">Snack</SelectItem>
            </SelectContent>
          </Select>
        </header>
      )}

      <main className="flex-1 overflow-y-auto px-4 pb-20 pt-4" style={activeTab === 'scan' ? { paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' } : undefined}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {activeTab !== 'scan' && (
            <TabsList className="grid w-full grid-cols-5 bg-[#0f172a]">
              <TabsTrigger value="saved" className="text-xs data-[state=active]:bg-[#1e293b]">
                Saved
              </TabsTrigger>
              <TabsTrigger value="recent" className="text-xs data-[state=active]:bg-[#1e293b]">
                Recent
              </TabsTrigger>
              <TabsTrigger value="search" className="text-xs data-[state=active]:bg-[#1e293b]">
                Search
              </TabsTrigger>
              <TabsTrigger value="scan" className="text-xs data-[state=active]:bg-[#1e293b]">
                Scan
              </TabsTrigger>
              <TabsTrigger value="manual" className="text-xs data-[state=active]:bg-[#1e293b]">
                Manual
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="saved" className="mt-3">
            <SavedTab
              onSelectFood={(food) => setQuantityFood(food)}
              onQuickAddFood={(food) => addFoodToLog(food)}
              onSelectMeal={(meal) => setSelectedMeal(meal)}
            />
          </TabsContent>

          <TabsContent value="recent" className="mt-3">
            <RecentTab
              onSelectFood={(food) => setQuantityFood(food)}
              onQuickAddFood={(food) => addFoodToLog(food)}
            />
          </TabsContent>

          <TabsContent value="search" className="mt-3">
            <SearchTab
              onSelectFood={(food) => setQuantityFood(food)}
              onQuickAddFood={(food) => addFoodToLog(food)}
            />
          </TabsContent>

          <TabsContent value="scan" className="mt-3">
            <ScanTab
              onAddFood={(food, servings) => addFoodToLog(food, servings)}
              onManualEntry={(barcode) => {
                setManualBarcode(barcode)
                setActiveTab('manual')
              }}
              onCancel={() => setActiveTab('recent')}
            />
          </TabsContent>

          <TabsContent value="manual" className="mt-3">
            <ManualTab
              initialBarcode={manualBarcode}
              onSubmit={handleManualSubmit}
              loading={manualLoading}
            />
          </TabsContent>
        </Tabs>
      </main>

      <QuantityPicker
        food={quantityFood}
        open={!!quantityFood}
        onClose={() => setQuantityFood(null)}
        onConfirm={(food, servings) => {
          addFoodToLog(food, servings)
          setQuantityFood(null)
        }}
      />

      <MealServingsPicker
        meal={selectedMeal}
        open={!!selectedMeal}
        onClose={() => setSelectedMeal(null)}
        onConfirm={(meal, servings) => {
          addMealToLog(meal, servings)
          setSelectedMeal(null)
        }}
      />

      <BottomNav />
    </div>
  )
}
