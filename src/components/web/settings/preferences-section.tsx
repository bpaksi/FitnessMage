'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MealTimeBoundaries, WeekStartDay, Units } from '@/lib/types/settings'

interface PreferencesSectionProps {
  weekStart: WeekStartDay
  units: Units
  mealTimes: MealTimeBoundaries
  onWeekStartChange: (val: WeekStartDay) => void
  onUnitsChange: (val: Units) => void
  onMealTimesChange: (mealTimes: MealTimeBoundaries) => void
  onSaveMealTimes: () => void
}

const DAYS: WeekStartDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export function PreferencesSection({
  weekStart,
  units,
  mealTimes,
  onWeekStartChange,
  onUnitsChange,
  onMealTimesChange,
  onSaveMealTimes,
}: PreferencesSectionProps) {
  return (
    <Card className="border-[#1e293b] bg-[#0f172a]">
      <CardHeader>
        <CardTitle className="text-base text-[#f8fafc]">Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Week Start & Units */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Week Starts On</Label>
            <Select
              value={weekStart}
              onValueChange={(val) => onWeekStartChange(val as WeekStartDay)}
            >
              <SelectTrigger className="border-[#1e293b] bg-[#020817] text-[#f8fafc]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#1e293b] bg-[#0f172a]">
                {DAYS.map((day) => (
                  <SelectItem key={day} value={day} className="capitalize text-[#f8fafc]">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Units</Label>
            <Select value={units} onValueChange={(val) => onUnitsChange(val as Units)}>
              <SelectTrigger className="border-[#1e293b] bg-[#020817] text-[#f8fafc]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#1e293b] bg-[#0f172a]">
                <SelectItem value="metric" className="text-[#f8fafc]">
                  Metric
                </SelectItem>
                <SelectItem value="imperial" className="text-[#f8fafc]">
                  Imperial
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-[#1e293b]" />

        {/* Meal Time Boundaries */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-[#f8fafc]">Meal Time Boundaries</p>
          {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
            <div key={meal} className="space-y-2">
              <Label className="capitalize text-[#94a3b8]">{meal}</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="time"
                  value={mealTimes[meal].start}
                  onChange={(e) =>
                    onMealTimesChange({
                      ...mealTimes,
                      [meal]: { ...mealTimes[meal], start: e.target.value },
                    })
                  }
                  className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
                />
                <span className="text-[#64748b]">to</span>
                <Input
                  type="time"
                  value={mealTimes[meal].end}
                  onChange={(e) =>
                    onMealTimesChange({
                      ...mealTimes,
                      [meal]: { ...mealTimes[meal], end: e.target.value },
                    })
                  }
                  className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
                />
              </div>
            </div>
          ))}
          <Button
            onClick={onSaveMealTimes}
            className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
          >
            Save Meal Times
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
