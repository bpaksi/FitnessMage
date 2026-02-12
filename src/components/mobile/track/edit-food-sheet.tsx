'use client'

import { useState, useEffect } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/mobile/api-client'
import type { DailyLogEntry } from '@/lib/types/log'

interface EditFoodSheetProps {
  entry: DailyLogEntry | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function EditFoodSheet({ entry, open, onClose, onSaved }: EditFoodSheetProps) {
  const [name, setName] = useState('')
  const [servingSize, setServingSize] = useState('')
  const [calories, setCalories] = useState(0)
  const [protein, setProtein] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const [fat, setFat] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (entry?.food) {
      setName(entry.food.name)
      setServingSize(entry.food.serving_size || '')
      // Normalize to per-serving values
      const s = entry.servings || 1
      setCalories(Math.round(Number(entry.calories) / s))
      setProtein(Math.round((Number(entry.protein) / s) * 10) / 10)
      setCarbs(Math.round((Number(entry.carbs) / s) * 10) / 10)
      setFat(Math.round((Number(entry.fat) / s) * 10) / 10)
    }
  }, [entry])

  async function handleSave() {
    if (!entry?.food_id) return
    setSaving(true)
    try {
      await apiClient(`/api/foods/${entry.food_id}`, {
        method: 'PUT',
        body: { name, serving_size: servingSize, calories, protein, carbs, fat },
      })
      onSaved()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'border-[#1e293b] bg-[#020817] text-[#f8fafc]'

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="border-[#1e293b] bg-[#0f172a]">
        <DrawerHeader>
          <DrawerTitle className="text-[#f8fafc]">Edit Food</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-3 px-4 pb-8">
          <div className="space-y-1.5">
            <Label className="text-[#94a3b8]">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[#94a3b8]">Serving Size</Label>
            <Input value={servingSize} onChange={(e) => setServingSize(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8]">Calories</Label>
              <Input type="number" value={calories} onChange={(e) => setCalories(+e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8]">Protein (g)</Label>
              <Input type="number" step="0.1" value={protein} onChange={(e) => setProtein(+e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8]">Carbs (g)</Label>
              <Input type="number" step="0.1" value={carbs} onChange={(e) => setCarbs(+e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94a3b8]">Fat (g)</Label>
              <Input type="number" step="0.1" value={fat} onChange={(e) => setFat(+e.target.value)} className={inputClass} />
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#3b82f6] text-white hover:bg-[#2563eb]"
          >
            {saving ? 'Saving...' : 'Save Food'}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
