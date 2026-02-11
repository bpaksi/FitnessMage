'use client'

import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
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
import type { MealType } from '@/lib/types/log'

interface CopyMealSheetProps {
  targetDate: string
  open: boolean
  onClose: () => void
  onCopy: (sourceDate: string, sourceMealType: MealType, targetMealType: MealType) => void
}

export function CopyMealSheet({ targetDate, open, onClose, onCopy }: CopyMealSheetProps) {
  const yesterday = new Date(targetDate + 'T12:00:00')
  yesterday.setDate(yesterday.getDate() - 1)

  const [sourceDate, setSourceDate] = useState(yesterday.toISOString().split('T')[0])
  const [sourceMealType, setSourceMealType] = useState<MealType>('breakfast')
  const [targetMealType, setTargetMealType] = useState<MealType>('breakfast')

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="border-[#1e293b] bg-[#0f172a]">
        <DrawerHeader>
          <DrawerTitle className="text-[#f8fafc]">Copy Meal</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 px-4 pb-8">
          <div className="space-y-1.5">
            <Label className="text-[#94a3b8]">From date</Label>
            <Input
              type="date"
              value={sourceDate}
              onChange={(e) => setSourceDate(e.target.value)}
              max={targetDate}
              className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[#94a3b8]">From meal</Label>
            <Select value={sourceMealType} onValueChange={(v) => setSourceMealType(v as MealType)}>
              <SelectTrigger className="border-[#1e293b] bg-[#020817] text-[#f8fafc]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#1e293b] bg-[#0f172a]">
                <SelectItem value="breakfast" className="text-[#f8fafc]">Breakfast</SelectItem>
                <SelectItem value="lunch" className="text-[#f8fafc]">Lunch</SelectItem>
                <SelectItem value="dinner" className="text-[#f8fafc]">Dinner</SelectItem>
                <SelectItem value="snack" className="text-[#f8fafc]">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[#94a3b8]">To meal</Label>
            <Select value={targetMealType} onValueChange={(v) => setTargetMealType(v as MealType)}>
              <SelectTrigger className="border-[#1e293b] bg-[#020817] text-[#f8fafc]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#1e293b] bg-[#0f172a]">
                <SelectItem value="breakfast" className="text-[#f8fafc]">Breakfast</SelectItem>
                <SelectItem value="lunch" className="text-[#f8fafc]">Lunch</SelectItem>
                <SelectItem value="dinner" className="text-[#f8fafc]">Dinner</SelectItem>
                <SelectItem value="snack" className="text-[#f8fafc]">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => onCopy(sourceDate, sourceMealType, targetMealType)}
            className="w-full bg-[#3b82f6] text-white hover:bg-[#2563eb]"
          >
            Copy Meal
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
