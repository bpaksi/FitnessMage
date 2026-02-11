'use client'

import { useEffect, useState } from 'react'
import { Plus, UtensilsCrossed, BookOpen, Pencil, Trash2 } from 'lucide-react'
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
import { MealDialog } from '@/components/web/meal-dialog'
import { FoodDialog } from '@/components/web/food-dialog'
import type { Meal } from '@/lib/types/meal'
import type { Food } from '@/lib/types/food'

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [mealDialogOpen, setMealDialogOpen] = useState(false)
  const [foodDialogOpen, setFoodDialogOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [editingFood, setEditingFood] = useState<Food | null>(null)

  useEffect(() => {
    (async () => {
      const [mealsRes, foodsRes] = await Promise.all([
        fetch('/api/meals'),
        fetch('/api/foods/library'),
      ])
      if (mealsRes.ok) setMeals(await mealsRes.json())
      if (foodsRes.ok) setFoods(await foodsRes.json())
      setLoading(false)
    })()
  }, [])

  async function fetchMeals() {
    const res = await fetch('/api/meals')
    if (res.ok) setMeals(await res.json())
  }

  async function fetchFoods() {
    const res = await fetch('/api/foods/library')
    if (res.ok) setFoods(await res.json())
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

  async function deleteFood(id: string) {
    const res = await fetch(`/api/foods/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Food deleted')
      fetchFoods()
    } else {
      toast.error('Failed to delete food')
    }
  }

  function openEditMeal(meal: Meal) {
    setEditingMeal(meal)
    setMealDialogOpen(true)
  }

  function openCreateMeal() {
    setEditingMeal(null)
    setMealDialogOpen(true)
  }

  function openEditFood(food: Food) {
    setEditingFood(food)
    setFoodDialogOpen(true)
  }

  function openCreateFood() {
    setEditingFood(null)
    setFoodDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="text-2xl font-light tracking-tight text-[#f8fafc]">Meals & Foods</h1>

      {/* Saved Meals */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#f8fafc]">Saved Meals</h2>
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

      {/* Food Library */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#f8fafc]">Food Library</h2>
          <Button onClick={openCreateFood} className="bg-[#3b82f6] text-white hover:bg-[#2563eb]">
            <Plus className="mr-1 h-4 w-4" />
            New Food
          </Button>
        </div>

        {foods.length === 0 ? (
          <Card className="border-[#1e293b] bg-[#0f172a]">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <BookOpen className="h-10 w-10 text-[#64748b]" />
              <p className="text-sm text-[#64748b]">No custom foods yet</p>
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

      <MealDialog
        open={mealDialogOpen}
        onOpenChange={setMealDialogOpen}
        meal={editingMeal}
        onSaved={fetchMeals}
      />

      <FoodDialog
        open={foodDialogOpen}
        onOpenChange={setFoodDialogOpen}
        food={editingFood}
        onSaved={fetchFoods}
      />
    </div>
  )
}
