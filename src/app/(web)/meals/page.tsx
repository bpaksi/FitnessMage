'use client'

import { useEffect, useState } from 'react'
import { Plus, UtensilsCrossed, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { MealEditor, type SelectedFood } from '@/components/web/meal-editor'
import { FoodPicker } from '@/components/web/food-picker'
import type { Meal } from '@/lib/types/meal'
import type { Food } from '@/lib/types/food'

type View = 'list' | 'meal-editor' | 'food-picker'

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)

  // View state
  const [view, setView] = useState<View>('list')
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)

  // Lifted meal editor state (persists across view switches)
  const [mealName, setMealName] = useState('')
  const [mealTotalServings, setMealTotalServings] = useState(1)
  const [mealFoods, setMealFoods] = useState<SelectedFood[]>([])

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/meals')
      if (res.ok) setMeals(await res.json())
      setLoading(false)
    })()
  }, [])

  async function fetchMeals() {
    const res = await fetch('/api/meals')
    if (res.ok) setMeals(await res.json())
  }

  async function deleteMeal(id: string) {
    const res = await fetch(`/api/meals/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Meal deleted')
      fetchMeals()
    } else {
      toast.error('Failed to delete meal')
    }
  }

  function openCreateMeal() {
    setEditingMeal(null)
    setMealName('')
    setMealTotalServings(1)
    setMealFoods([])
    setView('meal-editor')
  }

  function openEditMeal(meal: Meal) {
    setEditingMeal(meal)
    setMealName(meal.name)
    setMealTotalServings(meal.total_servings || 1)
    setMealFoods(meal.foods.map((mf) => ({ food: mf.food, servings: mf.servings })))
    setView('meal-editor')
  }

  function handleMealSaved() {
    fetchMeals()
    setView('list')
  }

  function handleFoodSelected(food: Food) {
    setMealFoods((prev) => [...prev, { food, servings: 1 }])
    setView('meal-editor')
  }

  const mealBreadcrumbLabel = editingMeal ? `Edit: ${editingMeal.name}` : 'Create Meal'

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
          <h1 className="text-2xl font-light tracking-tight text-[#f8fafc]">Saved Meals</h1>
        ) : (
          <>
            <button
              onClick={() => setView('list')}
              className="text-[#64748b] hover:text-[#f8fafc] transition-colors"
            >
              Saved Meals
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-[#64748b]" />
            {view === 'meal-editor' ? (
              <span className="text-[#f8fafc]">{mealBreadcrumbLabel}</span>
            ) : (
              <>
                <button
                  onClick={() => setView('meal-editor')}
                  className="text-[#64748b] hover:text-[#f8fafc] transition-colors"
                >
                  {mealBreadcrumbLabel}
                </button>
                <ChevronRight className="h-3.5 w-3.5 text-[#64748b]" />
                <span className="text-[#f8fafc]">Add Food</span>
              </>
            )}
          </>
        )}
      </nav>

      {/* Views */}
      {view === 'list' && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div />
            <Button onClick={openCreateMeal} className="bg-[#3b82f6] text-white hover:bg-[#2563eb]">
              <Plus className="mr-1 h-4 w-4" />
              New Meal
            </Button>
          </div>

          {meals.length === 0 ? (
            <Card className="border-[#1e293b] bg-[#0f172a]">
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <UtensilsCrossed className="h-10 w-10 text-[#64748b]" />
                <p className="text-sm text-[#64748b]">No saved meals yet</p>
                <Button onClick={openCreateMeal} className="bg-[#3b82f6] text-white hover:bg-[#2563eb]">
                  Create Your First Meal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {meals.map((meal) => {
                const totals = meal.foods.reduce(
                  (acc, mf) => ({
                    calories: acc.calories + Math.round(mf.food.calories * mf.servings),
                    protein: acc.protein + Math.round(mf.food.protein * mf.servings * 10) / 10,
                    carbs: acc.carbs + Math.round(mf.food.carbs * mf.servings * 10) / 10,
                    fat: acc.fat + Math.round(mf.food.fat * mf.servings * 10) / 10,
                  }),
                  { calories: 0, protein: 0, carbs: 0, fat: 0 },
                )

                return (
                  <Card key={meal.id} className="border-[#1e293b] bg-[#0f172a]">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                      <div>
                        <CardTitle className="text-base text-[#f8fafc]">{meal.name}</CardTitle>
                        {meal.total_servings > 1 && (
                          <p className="text-xs text-[#64748b]">Makes {meal.total_servings} servings</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditMeal(meal)}
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
                              <AlertDialogTitle className="text-[#f8fafc]">Delete Meal?</AlertDialogTitle>
                              <AlertDialogDescription className="text-[#64748b]">
                                This will permanently delete &quot;{meal.name}&quot;. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-[#1e293b] text-[#94a3b8]">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMeal(meal.id)}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3 space-y-1">
                        {meal.foods.slice(0, 3).map((mf) => (
                          <p key={mf.id} className="truncate text-xs text-[#94a3b8]">
                            {mf.food.name} ({mf.food.serving_size}) x{mf.servings}
                          </p>
                        ))}
                        {meal.foods.length > 3 && (
                          <p className="text-xs text-[#64748b]">+{meal.foods.length - 3} more</p>
                        )}
                        {meal.foods.length === 0 && (
                          <p className="text-xs text-[#64748b]">No foods</p>
                        )}
                      </div>
                      {meal.total_servings > 1 ? (
                        <>
                          <p className="mb-0.5 text-[10px] text-[#64748b]">Per serving</p>
                          <div className="flex gap-3 text-xs">
                            <span className="text-[#22c55e]">{Math.round(totals.calories / meal.total_servings)} cal</span>
                            <span className="text-[#ef4444]">{Math.round(totals.protein / meal.total_servings * 10) / 10}g P</span>
                            <span className="text-[#3b82f6]">{Math.round(totals.carbs / meal.total_servings * 10) / 10}g C</span>
                            <span className="text-[#eab308]">{Math.round(totals.fat / meal.total_servings * 10) / 10}g F</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex gap-3 text-xs">
                          <span className="text-[#22c55e]">{totals.calories} cal</span>
                          <span className="text-[#ef4444]">{totals.protein}g P</span>
                          <span className="text-[#3b82f6]">{totals.carbs}g C</span>
                          <span className="text-[#eab308]">{totals.fat}g F</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      )}

      {view === 'meal-editor' && (
        <MealEditor
          meal={editingMeal}
          name={mealName}
          setName={setMealName}
          totalServings={mealTotalServings}
          setTotalServings={setMealTotalServings}
          foods={mealFoods}
          setFoods={setMealFoods}
          onSaved={handleMealSaved}
          onBack={() => setView('list')}
          onAddFood={() => setView('food-picker')}
        />
      )}

      {view === 'food-picker' && (
        <FoodPicker onSelect={handleFoodSelected} />
      )}
    </div>
  )
}
