'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Star, Clock, PenLine, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Food } from '@/lib/types/food'

interface FoodPickerProps {
  onSelect: (food: Food) => void
}

function FoodResultItem({ food, onSelect }: { food: Food; onSelect: (food: Food) => void }) {
  return (
    <button
      onClick={() => onSelect(food)}
      className="w-full rounded-md border border-[#1e293b] p-3 text-left transition-colors hover:bg-[#020817]"
    >
      <p className="text-sm font-medium text-[#f8fafc]">
        {food.name} ({food.serving_size})
      </p>
      {food.brand && <p className="text-xs text-[#64748b]">{food.brand}</p>}
      <div className="mt-1 flex gap-3 text-xs text-[#94a3b8]">
        <span>{food.calories} cal</span>
        <span>{food.protein}g P</span>
        <span>{food.carbs}g C</span>
        <span>{food.fat}g F</span>
      </div>
    </button>
  )
}

function SearchPanel({ onSelect }: { onSelect: (food: Food) => void }) {
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
      if (res.ok) setResults(await res.json())
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  return (
    <div className="space-y-3">
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
      <div className="space-y-2">
        {searching && <p className="py-4 text-center text-sm text-[#64748b]">Searching...</p>}
        {!searching && query.length >= 2 && results.length === 0 && (
          <p className="py-4 text-center text-sm text-[#64748b]">No foods found</p>
        )}
        {results.map((food) => (
          <FoodResultItem key={food.id} food={food} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

function FavoritesPanel({ onSelect }: { onSelect: (food: Food) => void }) {
  const [favorites, setFavorites] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/foods/favorites')
      .then((res) => (res.ok ? res.json() : []))
      .then(setFavorites)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="py-4 text-center text-sm text-[#64748b]">Loading...</p>

  if (favorites.length === 0) {
    return (
      <div className="py-8 text-center">
        <Star className="mx-auto mb-2 h-6 w-6 text-[#64748b]" />
        <p className="text-sm text-[#64748b]">No favorite foods yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {favorites.map((food) => (
        <FoodResultItem key={food.id} food={food} onSelect={onSelect} />
      ))}
    </div>
  )
}

function RecentPanel({ onSelect }: { onSelect: (food: Food) => void }) {
  const [recent, setRecent] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/foods/recent')
      .then((res) => (res.ok ? res.json() : []))
      .then(setRecent)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="py-4 text-center text-sm text-[#64748b]">Loading...</p>

  if (recent.length === 0) {
    return (
      <div className="py-8 text-center">
        <Clock className="mx-auto mb-2 h-6 w-6 text-[#64748b]" />
        <p className="text-sm text-[#64748b]">No recently logged foods</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {recent.map((food) => (
        <FoodResultItem key={food.id} food={food} onSelect={onSelect} />
      ))}
    </div>
  )
}

function ManualPanel({ onSelect }: { onSelect: (food: Food) => void }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    brand: '',
    serving_size: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.serving_size.trim()) {
      toast.error('Name and serving size are required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          brand: form.brand.trim() || undefined,
          serving_size: form.serving_size.trim(),
          calories: Number(form.calories) || 0,
          protein: Number(form.protein) || 0,
          carbs: Number(form.carbs) || 0,
          fat: Number(form.fat) || 0,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to create food')
        return
      }

      const food: Food = await res.json()
      onSelect(food)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs text-[#94a3b8]">Name</Label>
          <Input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
            placeholder="e.g. Grilled Chicken"
          />
        </div>
        <div>
          <Label className="text-xs text-[#94a3b8]">Brand</Label>
          <Input
            value={form.brand}
            onChange={(e) => updateField('brand', e.target.value)}
            className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
            placeholder="Optional"
          />
        </div>
        <div>
          <Label className="text-xs text-[#94a3b8]">Serving Size</Label>
          <Input
            value={form.serving_size}
            onChange={(e) => updateField('serving_size', e.target.value)}
            className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
            placeholder="e.g. 100g"
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div>
          <Label className="text-xs text-[#94a3b8]">Calories</Label>
          <Input
            type="number"
            value={form.calories}
            onChange={(e) => updateField('calories', e.target.value)}
            className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
          />
        </div>
        <div>
          <Label className="text-xs text-[#94a3b8]">Protein</Label>
          <Input
            type="number"
            value={form.protein}
            onChange={(e) => updateField('protein', e.target.value)}
            className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
          />
        </div>
        <div>
          <Label className="text-xs text-[#94a3b8]">Carbs</Label>
          <Input
            type="number"
            value={form.carbs}
            onChange={(e) => updateField('carbs', e.target.value)}
            className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
          />
        </div>
        <div>
          <Label className="text-xs text-[#94a3b8]">Fat</Label>
          <Input
            type="number"
            value={form.fat}
            onChange={(e) => updateField('fat', e.target.value)}
            className="border-[#1e293b] bg-[#020817] text-[#f8fafc]"
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={saving}
        className="w-full bg-[#3b82f6] text-white hover:bg-[#2563eb]"
      >
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PenLine className="mr-2 h-4 w-4" />}
        Create & Add
      </Button>
    </form>
  )
}

export function FoodPicker({ onSelect }: FoodPickerProps) {
  const [tab, setTab] = useState('search')

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="grid w-full grid-cols-4 bg-[#020817]">
        <TabsTrigger value="search" className="text-xs data-[state=active]:bg-[#1e293b]">
          Search
        </TabsTrigger>
        <TabsTrigger value="favorites" className="text-xs data-[state=active]:bg-[#1e293b]">
          Favorites
        </TabsTrigger>
        <TabsTrigger value="recent" className="text-xs data-[state=active]:bg-[#1e293b]">
          Recent
        </TabsTrigger>
        <TabsTrigger value="manual" className="text-xs data-[state=active]:bg-[#1e293b]">
          Manual
        </TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="mt-3">
        <SearchPanel onSelect={onSelect} />
      </TabsContent>
      <TabsContent value="favorites" className="mt-3">
        <FavoritesPanel onSelect={onSelect} />
      </TabsContent>
      <TabsContent value="recent" className="mt-3">
        <RecentPanel onSelect={onSelect} />
      </TabsContent>
      <TabsContent value="manual" className="mt-3">
        <ManualPanel onSelect={onSelect} />
      </TabsContent>
    </Tabs>
  )
}
