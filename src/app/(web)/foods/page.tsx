'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, BookOpen, Star, Trash2, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, Pill, ScanBarcode } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { FoodEditor } from '@/components/web/food-editor'
import type { Food } from '@/lib/types/food'

type View = 'list' | 'food-editor' | 'barcode-debug'
type SortColumn = 'name' | 'calories' | 'protein' | 'carbs' | 'fat' | 'created_at'
type SortDirection = 'asc' | 'desc'

const PAGE_SIZE = 20

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return rtf.format(-seconds, 'second')
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return rtf.format(-minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  const days = Math.floor(hours / 24)
  if (days < 7) return rtf.format(-days, 'day')
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return rtf.format(-weeks, 'week')
  const months = Math.floor(days / 30)
  if (months < 12) return rtf.format(-months, 'month')
  return rtf.format(-Math.floor(days / 365), 'year')
}

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [editingFood, setEditingFood] = useState<Food | null>(null)
  const [view, setView] = useState<View>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [page, setPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'food' | 'supplement'>('all')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [barcodeResult, setBarcodeResult] = useState<unknown>(null)
  const [barcodeMainResult, setBarcodeMainResult] = useState<unknown>(null)
  const [barcodeLoading, setBarcodeLoading] = useState(false)

  const filtered = useMemo(() => {
    let result = foods
    if (categoryFilter !== 'all') {
      result = result.filter((f) => f.category === categoryFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((f) =>
        f.name.toLowerCase().includes(q) ||
        (f.brand && f.brand.toLowerCase().includes(q)) ||
        (f.serving_size && f.serving_size.toLowerCase().includes(q))
      )
    }
    return result
  }, [foods, searchQuery, categoryFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp: number
      if (sortColumn === 'name') {
        cmp = a.name.localeCompare(b.name)
      } else if (sortColumn === 'created_at') {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else {
        cmp = a[sortColumn] - b[sortColumn]
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortColumn, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const showingFrom = sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(safePage * PAGE_SIZE, sorted.length)

  function handleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
    setPage(1)
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    setPage(1)
  }

  function renderSortIcon(column: SortColumn) {
    if (sortColumn !== column) return <ArrowUpDown className="ml-1 inline h-3 w-3" />
    return sortDirection === 'asc'
      ? <ArrowUp className="ml-1 inline h-3 w-3" />
      : <ArrowDown className="ml-1 inline h-3 w-3" />
  }

  useEffect(() => {
    (async () => {
      const [libRes, favRes] = await Promise.all([
        fetch('/api/foods/library'),
        fetch('/api/foods/favorites'),
      ])
      if (libRes.ok) setFoods(await libRes.json())
      if (favRes.ok) {
        const favFoods: Food[] = await favRes.json()
        setFavoriteIds(new Set(favFoods.map((f) => f.id)))
      }
      setLoading(false)
    })()
  }, [])

  async function fetchFoods() {
    const res = await fetch('/api/foods/library')
    if (res.ok) setFoods(await res.json())
  }

  async function toggleFavorite(foodId: string) {
    const isFavorite = favoriteIds.has(foodId)
    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (isFavorite) next.delete(foodId)
      else next.add(foodId)
      return next
    })
    const res = await fetch('/api/foods/favorites', {
      method: isFavorite ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ food_id: foodId }),
    })
    if (!res.ok) {
      // Revert on failure
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (isFavorite) next.add(foodId)
        else next.delete(foodId)
        return next
      })
    }
  }

  async function deleteFood(id: string) {
    const res = await fetch(`/api/foods/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Food deleted')
      fetchFoods()
    } else {
      toast.error('Failed to delete food')
    }
  }

  function openEditFood(food: Food) {
    setEditingFood(food)
    setView('food-editor')
  }

  function openCreateFood() {
    setEditingFood(null)
    setView('food-editor')
  }

  function handleFoodSaved() {
    fetchFoods()
    setView('list')
  }

  const breadcrumbLabel = view === 'barcode-debug'
    ? 'Barcode Lookup'
    : editingFood ? `Edit: ${editingFood.name}` : 'New Food'

  async function lookupBarcode() {
    if (!barcodeInput.trim()) return
    setBarcodeLoading(true)
    setBarcodeResult(null)
    setBarcodeMainResult(null)
    const code = encodeURIComponent(barcodeInput.trim())
    try {
      const [debugRes, mainRes] = await Promise.all([
        fetch(`/api/foods/barcode/debug?code=${code}`),
        fetch(`/api/foods/barcode?code=${code}`),
      ])
      const [debugData, mainData] = await Promise.all([debugRes.json(), mainRes.json()])
      setBarcodeResult(debugData)
      setBarcodeMainResult(mainData)
    } catch (e) {
      setBarcodeResult({ error: e instanceof Error ? e.message : 'Request failed' })
    } finally {
      setBarcodeLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-1.5 text-sm">
        {view === 'list' ? (
          <h1 className="text-2xl font-light tracking-tight text-[#f8fafc]">Food Library</h1>
        ) : (
          <>
            <button
              onClick={() => setView('list')}
              className="text-[#64748b] hover:text-[#f8fafc] transition-colors"
            >
              Food Library
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-[#64748b]" />
            <span className="text-[#f8fafc]">{breadcrumbLabel}</span>
          </>
        )}
      </nav>

      {view === 'list' && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
              <Input
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="border-[#1e293b] bg-[#0f172a] pl-9 text-[#f8fafc] placeholder:text-[#64748b]"
              />
            </div>
            <div className="flex gap-1 rounded-lg bg-[#0f172a] p-1">
              {(['all', 'food', 'supplement'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategoryFilter(cat); setPage(1) }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-[#1e293b] text-[#f8fafc]'
                      : 'text-[#64748b] hover:text-[#94a3b8]'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat === 'food' ? 'Foods' : 'Supplements'}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setView('barcode-debug')}
              className="border-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc]"
            >
              <ScanBarcode className="mr-1 h-4 w-4" />
              Barcode Lookup
            </Button>
            <Button onClick={openCreateFood} className="bg-[#3b82f6] text-white hover:bg-[#2563eb]">
              <Plus className="mr-1 h-4 w-4" />
              New Food
            </Button>
          </div>

          {foods.length === 0 ? (
            <Card className="border-[#1e293b] bg-[#0f172a]">
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <BookOpen className="h-10 w-10 text-[#64748b]" />
                <p className="text-sm text-[#64748b]">No foods yet</p>
                <Button onClick={openCreateFood} className="bg-[#3b82f6] text-white hover:bg-[#2563eb]">
                  Create Your First Food
                </Button>
              </CardContent>
            </Card>
          ) : paginated.length === 0 ? (
            <Card className="border-[#1e293b] bg-[#0f172a]">
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <Search className="h-10 w-10 text-[#64748b]" />
                <p className="text-sm text-[#64748b]">No foods found for &quot;{searchQuery}&quot;</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-[#1e293b] bg-[#0f172a]">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#1e293b]">
                          <th
                            className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-[#64748b] hover:text-[#f8fafc] transition-colors"
                            onClick={() => handleSort('name')}
                          >
                            Name {renderSortIcon('name')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b]">Serving</th>
                          <th
                            className="cursor-pointer px-4 py-3 text-right text-xs font-medium text-[#64748b] hover:text-[#f8fafc] transition-colors"
                            onClick={() => handleSort('calories')}
                          >
                            Cal {renderSortIcon('calories')}
                          </th>
                          <th
                            className="cursor-pointer px-4 py-3 text-right text-xs font-medium text-[#64748b] hover:text-[#f8fafc] transition-colors"
                            onClick={() => handleSort('protein')}
                          >
                            P {renderSortIcon('protein')}
                          </th>
                          <th
                            className="cursor-pointer px-4 py-3 text-right text-xs font-medium text-[#64748b] hover:text-[#f8fafc] transition-colors"
                            onClick={() => handleSort('carbs')}
                          >
                            C {renderSortIcon('carbs')}
                          </th>
                          <th
                            className="cursor-pointer px-4 py-3 text-right text-xs font-medium text-[#64748b] hover:text-[#f8fafc] transition-colors"
                            onClick={() => handleSort('fat')}
                          >
                            F {renderSortIcon('fat')}
                          </th>
                          <th
                            className="cursor-pointer px-4 py-3 text-right text-xs font-medium text-[#64748b] hover:text-[#f8fafc] transition-colors"
                            onClick={() => handleSort('created_at')}
                          >
                            Added {renderSortIcon('created_at')}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-[#64748b]"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.map((food) => (
                          <tr
                            key={food.id}
                            onClick={() => openEditFood(food)}
                            className="cursor-pointer border-b border-[#1e293b] last:border-0 hover:bg-[#1e293b]/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="text-sm text-[#f8fafc]">
                                {food.category === 'supplement' && <Pill size={14} className="mr-1 inline text-[#a78bfa]" />}
                                {food.name}
                              </p>
                              {food.brand && <p className="text-xs text-[#64748b]">{food.brand}</p>}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#94a3b8]">{food.serving_size}</td>
                            <td className="px-4 py-3 text-right text-sm text-[#22c55e]">{food.calories}</td>
                            <td className="px-4 py-3 text-right text-sm text-[#ef4444]">{food.protein}g</td>
                            <td className="px-4 py-3 text-right text-sm text-[#3b82f6]">{food.carbs}g</td>
                            <td className="px-4 py-3 text-right text-sm text-[#eab308]">{food.fat}g</td>
                            <td className="px-4 py-3 text-right text-xs text-[#64748b]">{formatRelativeTime(food.created_at)}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {food.source !== 'manual' && (
                                  <span className="mr-1 text-xs text-[#64748b]">{food.source === 'usda' ? 'USDA' : 'OFF'}</span>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); toggleFavorite(food.id) }}
                                  className={`h-8 w-8 p-0 ${favoriteIds.has(food.id) ? 'text-[#eab308]' : 'text-[#64748b] hover:text-[#eab308]'}`}
                                >
                                  <Star className={`h-3.5 w-3.5 ${favoriteIds.has(food.id) ? 'fill-current' : ''}`} />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="border-[#1e293b] bg-[#0f172a]">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-[#f8fafc]">Delete Food?</AlertDialogTitle>
                                      <AlertDialogDescription className="text-[#64748b]">
                                        This will permanently delete &quot;{food.name}&quot;. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-[#1e293b] text-[#94a3b8]">Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteFood(food.id)}
                                        className="bg-red-600 text-white hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-[#64748b]">
                  Showing {showingFrom}–{showingTo} of {sorted.length} foods
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={safePage <= 1}
                    className="border-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] disabled:opacity-40"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={safePage >= totalPages}
                    className="border-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {view === 'food-editor' && (
        <FoodEditor
          food={editingFood}
          onSaved={handleFoodSaved}
          onBack={() => setView('list')}
        />
      )}

      {view === 'barcode-debug' && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Enter barcode (e.g. 1620057978)"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookupBarcode()}
              className="max-w-sm border-[#1e293b] bg-[#0f172a] text-[#f8fafc] placeholder:text-[#64748b]"
            />
            <Button
              onClick={lookupBarcode}
              disabled={!barcodeInput.trim() || barcodeLoading}
              className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
            >
              {barcodeLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Look Up'
              )}
            </Button>
          </div>

          {barcodeMainResult != null && (
            <Card className="border-[#1e293b] bg-[#0f172a]">
              <CardContent className="p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#f8fafc]">Scan Result (what mobile sees)</p>
                <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap text-xs text-[#94a3b8]">
                  {JSON.stringify(barcodeMainResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {barcodeResult != null && (
            <Card className="border-[#1e293b] bg-[#0f172a]">
              <CardContent className="p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#64748b]">Debug (all sources)</p>
                <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap text-xs text-[#94a3b8]">
                  {JSON.stringify(barcodeResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  )
}
