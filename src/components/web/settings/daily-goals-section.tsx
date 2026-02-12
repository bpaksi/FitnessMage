'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MacroGoals } from '@/lib/types/settings'

interface DailyGoalsSectionProps {
  goals: MacroGoals
  savedGoals: MacroGoals
  onGoalsChange: (goals: MacroGoals) => void
  onSave: () => void
}

export function DailyGoalsSection({ goals, savedGoals, onGoalsChange, onSave }: DailyGoalsSectionProps) {
  function handleInputChange(field: keyof MacroGoals, value: number) {
    onGoalsChange({ ...goals, [field]: value })
  }

  const hasChanges =
    goals.calories !== savedGoals.calories ||
    goals.protein !== savedGoals.protein ||
    goals.carbs !== savedGoals.carbs ||
    goals.fat !== savedGoals.fat ||
    goals.water !== savedGoals.water

  return (
    <Card className="border-[#1e293b] bg-[#0f172a]">
      <CardHeader>
        <CardTitle className="text-base text-[#f8fafc]">Daily Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Macro Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Calories</Label>
            <Input
              type="number"
              value={goals.calories}
              onChange={(e) => handleInputChange('calories', +e.target.value)}
              className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Protein (g)</Label>
            <Input
              type="number"
              value={goals.protein}
              onChange={(e) => handleInputChange('protein', +e.target.value)}
              className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Carbs (g)</Label>
            <Input
              type="number"
              value={goals.carbs}
              onChange={(e) => handleInputChange('carbs', +e.target.value)}
              className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Fat (g)</Label>
            <Input
              type="number"
              value={goals.fat}
              onChange={(e) => handleInputChange('fat', +e.target.value)}
              className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Water (glasses)</Label>
            <Input
              type="number"
              value={goals.water}
              onChange={(e) => handleInputChange('water', +e.target.value)}
              className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onSave}
            className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
          >
            Save Goals
          </Button>
          <Button
            variant="outline"
            disabled={!hasChanges}
            onClick={() => onGoalsChange(savedGoals)}
            className="border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f8fafc] disabled:opacity-40"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
