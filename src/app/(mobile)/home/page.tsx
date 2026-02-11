'use client'

import { useMobileContext } from '@/contexts/mobile-context'
import { useDailySummary } from '@/hooks/use-daily-summary'
import { BottomNav } from '@/components/mobile/bottom-nav'
import { MacroProgressBar } from '@/components/mobile/macro-progress-bar'
import { DatePicker } from '@/components/mobile/date-picker'
import { EmptyState } from '@/components/mobile/empty-state'
import { Sparkles } from 'lucide-react'

export default function HomePage() {
  const { selectedDate } = useMobileContext()
  const { summary, isLoading } = useDailySummary(selectedDate)

  const hasEntries = summary && summary.entries.length > 0

  return (
    <div className="flex min-h-svh flex-col pb-20">
      {/* Header */}
      <header className="px-4 pt-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <h1 className="mb-4 text-lg font-light text-[#f8fafc]">
          Fitness<span className="font-medium text-[#3b82f6]"> Mage</span>
        </h1>
        <DatePicker />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-6">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-[#1e293b]" />
                <div className="h-2.5 w-full animate-pulse rounded-full bg-[#1e293b]" />
              </div>
            ))}
          </div>
        ) : hasEntries ? (
          <section className="space-y-5" aria-label="Daily macro progress">
            <MacroProgressBar
              label="Calories"
              current={summary.totals.calories}
              goal={summary.goals.calories}
              color="#22c55e"
              unit=" cal"
            />
            <MacroProgressBar
              label="Protein"
              current={summary.totals.protein}
              goal={summary.goals.protein}
              color="#ef4444"
              unit="g"
            />
            <MacroProgressBar
              label="Carbs"
              current={summary.totals.carbs}
              goal={summary.goals.carbs}
              color="#3b82f6"
              unit="g"
            />
            <MacroProgressBar
              label="Fat"
              current={summary.totals.fat}
              goal={summary.goals.fat}
              color="#eab308"
              unit="g"
            />
          </section>
        ) : (
          <EmptyState
            icon={<Sparkles size={40} />}
            message="Log your first meal to see your progress"
            ctaLabel="Add Food"
            ctaHref="/add"
          />
        )}
      </main>

      <BottomNav />
    </div>
  )
}
