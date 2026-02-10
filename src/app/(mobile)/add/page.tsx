'use client'

import { useState, useCallback } from 'react'
import { useMobileContext } from '@/contexts/mobile-context'
import { useDailySummary } from '@/hooks/use-daily-summary'
import { apiClient } from '@/lib/mobile/api-client'
import { getMealTypeForTime } from '@/lib/utils/meal-time'
import { showUndoToast } from '@/components/mobile/undo-toast'
import { BottomNav } from '@/components/mobile/bottom-nav'
import { FavoritesSection } from '@/components/mobile/add/favorites-section'
import { RecentTab } from '@/components/mobile/add/recent-tab'
import { SearchTab } from '@/components/mobile/add/search-tab'
import { ScanTab } from '@/components/mobile/add/scan-tab'
import { ManualTab } from '@/components/mobile/add/manual-tab'
import { QuantityPicker } from '@/components/mobile/add/quantity-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Food } from '@/lib/types/food'
import type { MealType, DailyLogEntry } from '@/lib/types/log'

function vibrate() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(50)
  }
}

export default function AddPage() {
  const { selectedDate, userSettings } = useMobileContext()
  const { mutate } = useDailySummary(selectedDate)
  const [activeTab, setActiveTab] = useState('recent')
  const [mealType, setMealType] = useState<MealType>(() =>
    getMealTypeForTime(undefined, userSettings?.meal_time_boundaries),
  )
  const [quantityFood, setQuantityFood] = useState<Food | null>(null)
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

        showUndoToast(entry.id, food.name, () => mutate())
      } catch {
        // Revert on error
        mutate()
      }
    },
    [selectedDate, mealType, mutate],
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
  }) {
    setManualLoading(true)
    try {
      const food = await apiClient<Food>('/api/foods', {
        method: 'POST',
        body: values,
      })
      await addFoodToLog(food)
    } finally {
      setManualLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col pb-20">
      <header
        className="space-y-3 px-4 pt-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      >
        <h1 className="text-lg font-medium text-[#f8fafc]">Add Food</h1>
        <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
          <SelectTrigger className="w-full border-[#1e293b] bg-[#0f172a] text-[#f8fafc]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-[#1e293b] bg-[#0f172a]">
            <SelectItem value="breakfast" className="text-[#f8fafc]">Breakfast</SelectItem>
            <SelectItem value="lunch" className="text-[#f8fafc]">Lunch</SelectItem>
            <SelectItem value="dinner" className="text-[#f8fafc]">Dinner</SelectItem>
            <SelectItem value="snack" className="text-[#f8fafc]">Snack</SelectItem>
          </SelectContent>
        </Select>
      </header>

      <main className="flex-1 px-4 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-[#0f172a]">
            <TabsTrigger value="favorites" className="text-xs data-[state=active]:bg-[#1e293b]">
              Faves
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

          <TabsContent value="favorites" className="mt-3">
            <FavoritesSection
              onTapFood={(food) => addFoodToLog(food)}
              onLongPressFood={(food) => setQuantityFood(food)}
            />
          </TabsContent>

          <TabsContent value="recent" className="mt-3">
            <RecentTab
              onTapFood={(food) => addFoodToLog(food)}
              onLongPressFood={(food) => setQuantityFood(food)}
            />
          </TabsContent>

          <TabsContent value="search" className="mt-3">
            <SearchTab
              onTapFood={(food) => addFoodToLog(food)}
              onLongPressFood={(food) => setQuantityFood(food)}
            />
          </TabsContent>

          <TabsContent value="scan" className="mt-3">
            <ScanTab
              onAddFood={(food) => addFoodToLog(food)}
              onManualEntry={(barcode) => {
                setManualBarcode(barcode)
                setActiveTab('manual')
              }}
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

      <BottomNav />
    </div>
  )
}
