'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DIET_PRESETS } from '@/lib/constants/diet-presets'
import type { MacroGoals } from '@/lib/types/settings'

interface DailyGoalsSectionProps {
  goals: MacroGoals
  onGoalsChange: (goals: MacroGoals) => void
  onSave: () => void
}

export function DailyGoalsSection({ goals, onGoalsChange, onSave }: DailyGoalsSectionProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null)

  function handlePresetClick(preset: (typeof DIET_PRESETS)[number]) {
    setActivePreset(preset.id)
    onGoalsChange(preset.goals)
  }

  function handleInputChange(field: keyof MacroGoals, value: number) {
    setActivePreset(null)
    onGoalsChange({ ...goals, [field]: value })
  }

  const activePhilosophy = DIET_PRESETS.find((p) => p.id === activePreset)?.philosophy

  return (
    <Card className="border-[#1e293b] bg-[#0f172a]">
      <CardHeader>
        <CardTitle className="text-base text-[#f8fafc]">Daily Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Diet Preset Pills */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {DIET_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  activePreset === preset.id
                    ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]'
                    : 'border-[#1e293b] text-[#94a3b8] hover:border-[#3b82f6]/50'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
          {activePhilosophy && (
            <p className="animate-in fade-in duration-300 text-xs text-[#64748b]">
              {activePhilosophy}
            </p>
          )}
        </div>

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
        </div>

        <Button
          onClick={onSave}
          className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
        >
          Save Goals
        </Button>
      </CardContent>
    </Card>
  )
}
