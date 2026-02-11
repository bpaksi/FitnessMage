'use client'

import { useState, useEffect } from 'react'
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
import type { Food } from '@/lib/types/food'

interface FoodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  food?: Food | null
  onSaved: () => void
}

export function FoodDialog({ open, onOpenChange, food, onSaved }: FoodDialogProps) {
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [servingSize, setServingSize] = useState('')
  const [calories, setCalories] = useState(0)
  const [protein, setProtein] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const [fat, setFat] = useState(0)
  const [saving, setSaving] = useState(false)

  const isEdit = !!food

  useEffect(() => {
    if (food) {
      setName(food.name)
      setBrand(food.brand || '')
      setServingSize(food.serving_size || '')
      setCalories(food.calories)
      setProtein(food.protein)
      setCarbs(food.carbs)
      setFat(food.fat)
    } else {
      setName('')
      setBrand('')
      setServingSize('')
      setCalories(0)
      setProtein(0)
      setCarbs(0)
      setFat(0)
    }
  }, [food, open])

  async function handleSave() {
    if (!name.trim() || !servingSize.trim()) {
      toast.error('Name and serving size are required')
      return
    }

    setSaving(true)
    try {
      const body = { name: name.trim(), brand: brand.trim() || undefined, serving_size: servingSize.trim(), calories, protein, carbs, fat }

      const res = isEdit
        ? await fetch(`/api/foods/${food.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/foods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

      if (res.ok) {
        toast.success(isEdit ? 'Food updated' : 'Food created')
        onSaved()
        onOpenChange(false)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#1e293b] bg-[#0f172a] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#f8fafc]">
            {isEdit ? 'Edit Food' : 'Create Custom Food'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
              placeholder="e.g. Chicken Breast"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Brand (optional)</Label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
              placeholder="e.g. Tyson"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94a3b8]">Serving Size</Label>
            <Input
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
              placeholder="e.g. 100g"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#94a3b8]">Calories</Label>
              <Input
                type="number"
                value={calories}
                onChange={(e) => setCalories(+e.target.value)}
                className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8]">Protein (g)</Label>
              <Input
                type="number"
                value={protein}
                onChange={(e) => setProtein(+e.target.value)}
                className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8]">Carbs (g)</Label>
              <Input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(+e.target.value)}
                className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#94a3b8]">Fat (g)</Label>
              <Input
                type="number"
                value={fat}
                onChange={(e) => setFat(+e.target.value)}
                className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
              />
            </div>
          </div>
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
  )
}
