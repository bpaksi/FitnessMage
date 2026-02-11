'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DIET_PRESETS } from '@/lib/constants/diet-presets'
import { calculatePersonalizedGoals } from '@/lib/utils/goal-calculator'
import type { BiologicalSex } from '@/lib/types/calculator'
import type { MacroGoals, Units } from '@/lib/types/settings'

interface MacroCalculatorSectionProps {
  units: Units
  onApply: (goals: MacroGoals) => void
}

export function MacroCalculatorSection({ units, onApply }: MacroCalculatorSectionProps) {
  const [sex, setSex] = useState<BiologicalSex>('male')
  const [weight, setWeight] = useState<number>(units === 'imperial' ? 170 : 77)
  const [activePreset, setActivePreset] = useState<string>('balanced')

  const preset = DIET_PRESETS.find((p) => p.id === activePreset)!
  const activePhilosophy = preset.philosophy

  const results = useMemo(
    () => calculatePersonalizedGoals(weight, units, sex, preset.ratio),
    [weight, units, sex, preset.ratio]
  )

  return (
    <Card className="border-[#1e293b] bg-[#0f172a]">
      <CardHeader>
        <CardTitle className="text-base text-[#f8fafc]">Macro Calculator</CardTitle>
        <p className="text-xs text-[#64748b]">
          Personalize your macro targets based on your body and diet preference
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Sex & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Sex</Label>
            <Select value={sex} onValueChange={(v) => setSex(v as BiologicalSex)}>
              <SelectTrigger className="w-full border-[#1e293b] bg-[#020817] text-[#f8fafc]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">
              Weight ({units === 'imperial' ? 'lbs' : 'kg'})
            </Label>
            <Input
              type="number"
              min={1}
              value={weight}
              onChange={(e) => setWeight(Math.max(1, +e.target.value))}
              className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
            />
          </div>
        </div>

        {/* Diet Philosophy Pills */}
        <div className="space-y-2">
          <Label className="text-[#94a3b8]">Diet Philosophy</Label>
          <div className="flex flex-wrap gap-2">
            {DIET_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePreset(p.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  activePreset === p.id
                    ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]'
                    : 'border-[#1e293b] text-[#94a3b8] hover:border-[#3b82f6]/50'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <p className="animate-in fade-in duration-300 text-xs text-[#64748b]">
            {activePhilosophy}
          </p>
        </div>

        {/* Results Preview */}
        <div className="space-y-2">
          <Label className="text-[#94a3b8]">Calculated Targets</Label>
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-lg border border-[#1e293b] bg-[#020817] p-3 text-center">
              <p className="text-lg font-semibold text-[#22c55e]">{results.calories}</p>
              <p className="text-[10px] text-[#64748b]">Calories</p>
            </div>
            <div className="rounded-lg border border-[#1e293b] bg-[#020817] p-3 text-center">
              <p className="text-lg font-semibold text-[#ef4444]">{results.protein}g</p>
              <p className="text-[10px] text-[#64748b]">Protein</p>
            </div>
            <div className="rounded-lg border border-[#1e293b] bg-[#020817] p-3 text-center">
              <p className="text-lg font-semibold text-[#3b82f6]">{results.carbs}g</p>
              <p className="text-[10px] text-[#64748b]">Carbs</p>
            </div>
            <div className="rounded-lg border border-[#1e293b] bg-[#020817] p-3 text-center">
              <p className="text-lg font-semibold text-[#eab308]">{results.fat}g</p>
              <p className="text-[10px] text-[#64748b]">Fat</p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onApply(results)}
          className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
        >
          Apply to Daily Goals
        </Button>
      </CardContent>
    </Card>
  )
}
