'use client'

import { useEffect, useState } from 'react'
import { Plus, BookOpen, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [editingFood, setEditingFood] = useState<Food | null>(null)
  const [view, setView] = useState<View>('list')

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
          <div className="mb-4 flex items-center justify-between">
            <div />
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
          ) : (
            <Card className="border-[#1e293b] bg-[#0f172a]">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1e293b]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b]">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b]">Serving</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#64748b]">Cal</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#64748b]">P</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#64748b]">C</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#64748b]">F</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#64748b]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {foods.map((food) => (
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
                            {food.source === 'manual' ? (
                              <div className="flex justify-end gap-1">
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
                            ) : (
                              <span className="text-xs text-[#64748b]">{food.source === 'usda' ? 'USDA' : 'OFF'}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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
