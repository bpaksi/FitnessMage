'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { RangeSelector } from '@/components/web/reports/range-selector'
import { OverviewSection } from '@/components/web/reports/overview-section'
import { NutrientsSection } from '@/components/web/reports/nutrients-section'
import type { ReportRange } from '@/lib/types/report'

function ReportsContent() {
  const searchParams = useSearchParams()
  const section = searchParams.get('section') ?? 'overview'
  const [range, setRange] = useState<ReportRange>('this_week')

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-tight text-[#f8fafc]">Reports</h1>
        <RangeSelector range={range} onRangeChange={setRange} />
      </div>

      {section === 'overview' && <OverviewSection range={range} />}
      {section === 'nutrients' && <NutrientsSection range={range} />}
    </div>
  )
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  )
}
