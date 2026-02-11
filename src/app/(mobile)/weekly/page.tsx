'use client'

import { useState } from 'react'
import { useMobileContext } from '@/contexts/mobile-context'
import { useWeeklySummary } from '@/hooks/use-weekly-summary'
import { BottomNav } from '@/components/mobile/bottom-nav'
import { WeekGrid } from '@/components/mobile/weekly/week-grid'
import { EmptyState } from '@/components/mobile/empty-state'
import { BarChart3 } from 'lucide-react'

function vibrate() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
}

export default function WeeklyPage() {
  const { selectedDate } = useMobileContext()
  const [weekOffset, setWeekOffset] = useState(0)

  // Calculate the reference date for the week
  const refDate = new Date(selectedDate + 'T12:00:00')
  refDate.setDate(refDate.getDate() + weekOffset * 7)
  const weekOf = refDate.toISOString().split('T')[0]

  const { weekly, isLoading } = useWeeklySummary(weekOf)

  function navigateWeek(offset: number) {
    vibrate()
    setWeekOffset((w) => w + offset)
  }

  const hasAnyData = weekly?.days.some((d) => d.totals !== null)

  return (
    <div className="flex min-h-svh flex-col pb-20">
      <header
        className="space-y-3 px-4 pt-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      >
        <h1 className="text-lg font-medium text-[#f8fafc]">Weekly</h1>

        {/* Week selector */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateWeek(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#94a3b8] transition-colors hover:bg-[#0f172a]"
            aria-label="Previous week"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <span className="text-sm text-[#f8fafc]">
            {weekly?.dates
              ? `${formatShortDate(weekly.dates[0])} – ${formatShortDate(weekly.dates[6])}`
              : '...'}
          </span>

          <button
            onClick={() => navigateWeek(1)}
            disabled={weekOffset >= 0}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#94a3b8] transition-colors hover:bg-[#0f172a] disabled:opacity-30"
            aria-label="Next week"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pt-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-[#0f172a]" />
            ))}
          </div>
        ) : weekly && hasAnyData ? (
          <WeekGrid days={weekly.days} goals={weekly.goals} />
        ) : (
          <EmptyState
            icon={<BarChart3 size={40} />}
            message="Complete a full day to see your weekly progress"
            ctaLabel="Log Food"
            ctaHref="/add"
          />
        )}
      </main>

      <BottomNav />
    </div>
  )
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
