'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { DailyGoalsSection } from '@/components/web/settings/daily-goals-section'
import { MacroCalculatorSection } from '@/components/web/settings/macro-calculator-section'
import { PreferencesSection } from '@/components/web/settings/preferences-section'
import { DataManagementSection } from '@/components/web/settings/data-management-section'
import type { UserSettings, MacroGoals, MealTimeBoundaries, WeekStartDay, Units } from '@/lib/types/settings'

function SettingsContent() {
  const searchParams = useSearchParams()
  const section = searchParams.get('section') ?? 'daily-goals'

  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [goals, setGoals] = useState<MacroGoals>({ calories: 2000, protein: 150, carbs: 200, fat: 65, water: 8 })
  const [weekStart, setWeekStart] = useState<WeekStartDay>('monday')
  const [units, setUnits] = useState<Units>('metric')
  const [mealTimes, setMealTimes] = useState<MealTimeBoundaries>({
    breakfast: { start: '06:00', end: '10:00' },
    lunch: { start: '11:00', end: '14:00' },
    dinner: { start: '17:00', end: '21:00' },
  })

  const fetchSettings = useCallback(async () => {
    const res = await fetch('/api/settings')
    if (res.ok) {
      const data: UserSettings = await res.json()
      setSettings(data)
      setGoals(data.goals)
      setWeekStart(data.week_start_day)
      setUnits(data.units)
      setMealTimes(data.meal_time_boundaries)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data: UserSettings = await res.json()
        setSettings(data)
        setGoals(data.goals)
        setWeekStart(data.week_start_day)
        setUnits(data.units)
        setMealTimes(data.meal_time_boundaries)
      }
    })()
  }, [])

  async function saveSettings(partial: Partial<UserSettings>) {
    const body = {
      goals: partial.goals ?? goals,
      week_start_day: partial.week_start_day ?? weekStart,
      units: partial.units ?? units,
      meal_time_boundaries: partial.meal_time_boundaries ?? mealTimes,
    }
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      toast.success('Settings saved')
      fetchSettings()
    } else {
      toast.error('Failed to save settings')
    }
  }

  if (!settings) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {section === 'daily-goals' && (
        <div className="space-y-6">
          <DailyGoalsSection
            goals={goals}
            savedGoals={settings.goals}
            onGoalsChange={setGoals}
            onSave={() => saveSettings({ goals })}
          />
          <MacroCalculatorSection
            units={units}
            onApply={setGoals}
          />
        </div>
      )}
      {section === 'preferences' && (
        <PreferencesSection
          weekStart={weekStart}
          units={units}
          mealTimes={mealTimes}
          onWeekStartChange={(val) => {
            setWeekStart(val)
            saveSettings({ week_start_day: val })
          }}
          onUnitsChange={(val) => {
            setUnits(val)
            saveSettings({ units: val })
          }}
          onMealTimesChange={setMealTimes}
          onSaveMealTimes={() => saveSettings({ meal_time_boundaries: mealTimes })}
        />
      )}
      {section === 'data' && (
        <DataManagementSection
          onDeleteAllData={() => toast.error('Not yet implemented')}
          onDeleteAccount={() => toast.error('Not yet implemented')}
        />
      )}
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  )
}
