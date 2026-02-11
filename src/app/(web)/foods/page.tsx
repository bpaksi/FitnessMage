'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, BookOpen, Pencil, Trash2, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft } from 'lucide-react'
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

type View = 'list' | 'food-editor'
type SortColumn = 'name' | 'calories' | 'protein' | 'carbs' | 'fat'
type SortDirection = 'asc' | 'desc'

const PAGE_SIZE = 20

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [editingFood, setEditingFood] = useState<Food | null>(null)
  const [view, setView] = useState<View>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return foods
    const q = searchQuery.toLowerCase()
    return foods.filter((f) =>
      f.name.toLowerCase().includes(q) ||
      (f.brand && f.brand.toLowerCase().includes(q)) ||
      (f.serving_size && f.serving_size.toLowerCase().includes(q))
    )
  }, [foods, searchQuery])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp: number
      if (sortColumn === 'name') {
        cmp = a.name.localeCompare(b.name)
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
      const res = await fetch('/api/foods/library')
      if (res.ok) setFoods(await res.json())
      setLoading(false)
    })()
  }, [])

  async function fetchFoods() {
    const res = await fetch('/api/foods/library')
    if (res.ok) setFoods(await res.json())
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

  const foodBreadcrumbLabel = editingFood ? `Edit: ${editingFood.name}` : 'New Food'

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
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
            <span className="text-[#f8fafc]">{foodBreadcrumbLabel}</span>
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
                          <th className="px-4 py-3 text-right text-xs font-medium text-[#64748b]"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.map((food) => (
                          <tr key={food.id} className="border-b border-[#1e293b] last:border-0">
                            <td className="px-4 py-3">
                              <p className="text-sm text-[#f8fafc]">{food.name}</p>
                              {food.brand && <p className="text-xs text-[#64748b]">{food.brand}</p>}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#94a3b8]">{food.serving_size}</td>
                            <td className="px-4 py-3 text-right text-sm text-[#22c55e]">{food.calories}</td>
                            <td className="px-4 py-3 text-right text-sm text-[#ef4444]">{food.protein}g</td>
                            <td className="px-4 py-3 text-right text-sm text-[#3b82f6]">{food.carbs}g</td>
                            <td className="px-4 py-3 text-right text-sm text-[#eab308]">{food.fat}g</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {food.source !== 'manual' && (
                                  <span className="mr-1 text-xs text-[#64748b]">{food.source === 'usda' ? 'USDA' : 'OFF'}</span>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditFood(food)}
                                  className="h-8 w-8 p-0 text-[#64748b] hover:text-[#f8fafc]"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
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
    </div>
  )
}
