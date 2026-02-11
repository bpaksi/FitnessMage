'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { FoodPickerDialog } from './food-picker-dialog'
import type { Food } from '@/lib/types/food'
import type { Meal } from '@/lib/types/meal'

interface SelectedFood {
  food: Food
  servings: number
}

interface MealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meal?: Meal | null
  onSaved: () => void
}

export function MealDialog({ open, onOpenChange, meal, onSaved }: MealDialogProps) {
  const [name, setName] = useState('')
  const [totalServings, setTotalServings] = useState(1)
  const [foods, setFoods] = useState<SelectedFood[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const isEdit = !!meal

  useEffect(() => {
    if (meal) {
      setName(meal.name)
      setTotalServings(meal.total_servings || 1)
      setFoods(
        meal.foods.map((mf) => ({
          food: mf.food,
          servings: mf.servings,
        })),
      )
    } else {
      setName('')
      setTotalServings(1)
      setFoods([])
    }
  }, [meal, open])

  function handleAddFood(food: Food) {
    setFoods((prev) => [...prev, { food, servings: 1 }])
  }

  function handleRemoveFood(index: number) {
    setFoods((prev) => prev.filter((_, i) => i !== index))
  }

  function handleServingsChange(index: number, servings: number) {
    setFoods((prev) =>
      prev.map((f, i) => (i === index ? { ...f, servings } : f)),
    )
  }

  const totals = foods.reduce(
    (acc, { food, servings }) => ({
      calories: acc.calories + Math.round(food.calories * servings),
      protein: acc.protein + Math.round(food.protein * servings * 10) / 10,
      carbs: acc.carbs + Math.round(food.carbs * servings * 10) / 10,
      fat: acc.fat + Math.round(food.fat * servings * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  const perServing = {
    calories: Math.round(totals.calories / totalServings),
    protein: Math.round((totals.protein / totalServings) * 10) / 10,
    carbs: Math.round((totals.carbs / totalServings) * 10) / 10,
    fat: Math.round((totals.fat / totalServings) * 10) / 10,
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Meal name is required')
      return
    }

    setSaving(true)
    try {
      if (isEdit) {
        // Update name and total_servings
        await fetch(`/api/meals/${meal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), total_servings: totalServings }),
        })

        // Reconcile foods: delete removed, add new, update changed servings
        const existingIds = new Set(meal.foods.map((mf) => mf.food.id))
        const currentFoodIds = new Set(foods.map((f) => f.food.id))

        // Delete removed foods
        for (const mf of meal.foods) {
          if (!currentFoodIds.has(mf.food.id)) {
            await fetch(`/api/meals/${meal.id}/foods/${mf.id}`, { method: 'DELETE' })
          }
        }

        // Add new foods
        for (const f of foods) {
          if (!existingIds.has(f.food.id)) {
            await fetch(`/api/meals/${meal.id}/foods`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ food_id: f.food.id, servings: f.servings }),
            })
          }
        }

        // Update servings for existing foods
        for (const f of foods) {
          const existing = meal.foods.find((mf) => mf.food.id === f.food.id)
          if (existing && existing.servings !== f.servings) {
            await fetch(`/api/meals/${meal.id}/foods/${existing.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ servings: f.servings }),
            })
          }
        }

        toast.success('Meal updated')
      } else {
        const res = await fetch('/api/meals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            total_servings: totalServings,
            foods: foods.map((f) => ({ food_id: f.food.id, servings: f.servings })),
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          toast.error(err.error || 'Failed to create meal')
          return
        }
        toast.success('Meal created')
      }

      onSaved()
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="border-[#1e293b] bg-[#0f172a] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#f8fafc]">
              {isEdit ? 'Edit Meal' : 'Create Meal'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#94a3b8]">Meal Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
                placeholder="e.g. Chicken & Rice Bowl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#94a3b8]">Makes __ servings</Label>
              <Input
                type="number"
                min={1}
                step={1}
                value={totalServings}
                onChange={(e) => setTotalServings(Math.max(1, +e.target.value || 1))}
                className="w-24 border-[#1e293b] bg-[#020817] text-[#f8fafc]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[#94a3b8]">Foods</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPickerOpen(true)}
                  className="border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b]"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Food
                </Button>
              </div>

              {foods.length === 0 ? (
                <p className="py-4 text-center text-sm text-[#64748b]">
                  No foods added yet
                </p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {foods.map((item, index) => (
                    <div
                      key={`${item.food.id}-${index}`}
                      className="flex items-center gap-3 rounded-md border border-[#1e293b] p-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm text-[#f8fafc]">
                          {item.food.name} ({item.food.serving_size})
                        </p>
                        <p className="text-xs text-[#64748b]">
                          {Math.round(item.food.calories * item.servings)} cal
                        </p>
                      </div>
                      <Input
                        type="number"
                        min={0.1}
                        step={0.5}
                        value={item.servings}
                        onChange={(e) => handleServingsChange(index, +e.target.value || 1)}
                        className="w-20 border-[#1e293b] bg-[#020817] text-center text-[#f8fafc]"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFood(index)}
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {foods.length > 0 && (
              <div className="rounded-md border border-[#1e293b] p-3">
                <p className="mb-1 text-xs font-medium text-[#64748b]">Meal Totals</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-[#22c55e]">{totals.calories} cal</span>
                  <span className="text-[#ef4444]">{totals.protein}g P</span>
                  <span className="text-[#3b82f6]">{totals.carbs}g C</span>
                  <span className="text-[#eab308]">{totals.fat}g F</span>
                </div>
                {totalServings > 1 && (
                  <>
                    <p className="mb-1 mt-2 text-xs font-medium text-[#64748b]">Per Serving</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-[#22c55e]">{perServing.calories} cal</span>
                      <span className="text-[#ef4444]">{perServing.protein}g P</span>
                      <span className="text-[#3b82f6]">{perServing.carbs}g C</span>
                      <span className="text-[#eab308]">{perServing.fat}g F</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#1e293b] text-[#94a3b8]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
            >
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FoodPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAddFood}
      />
    </>
  )
}
