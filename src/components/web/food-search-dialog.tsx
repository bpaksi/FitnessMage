'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Food } from '@/lib/types/food'

interface FoodSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (food: Food) => void
}

export function FoodSearchDialog({ open, onOpenChange, onSelect }: FoodSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [searching, setSearching] = useState(false)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data: Food[] = await res.json()
        setResults(data)
      }
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#1e293b] bg-[#0f172a] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#f8fafc]">Search Foods</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
          <Input
            placeholder="Search by name or brand..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-[#1e293b] bg-[#020817] pl-9 text-[#f8fafc]"
            autoFocus
          />
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {searching && (
            <p className="py-4 text-center text-sm text-[#64748b]">Searching...</p>
          )}
          {!searching && query.length >= 2 && results.length === 0 && (
            <p className="py-4 text-center text-sm text-[#64748b]">No foods found</p>
          )}
          {results.map((food) => (
            <button
              key={food.id}
              onClick={() => {
                onSelect(food)
                onOpenChange(false)
              }}
              className="w-full rounded-md border border-[#1e293b] p-3 text-left transition-colors hover:bg-[#020817]"
            >
              <p className="text-sm font-medium text-[#f8fafc]">
                {food.name} ({food.serving_size})
              </p>
              {food.brand && (
                <p className="text-xs text-[#64748b]">{food.brand}</p>
              )}
              <div className="mt-1 flex gap-3 text-xs text-[#94a3b8]">
                <span>{food.calories} cal</span>
                <span>{food.protein}g P</span>
                <span>{food.carbs}g C</span>
                <span>{food.fat}g F</span>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
