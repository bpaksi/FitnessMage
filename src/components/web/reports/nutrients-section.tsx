'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Pill, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ReportRange, NutrientReportData, NutrientReportEntry } from '@/lib/types/report'

interface NutrientsSectionProps {
  range: ReportRange
}

function getStatusColor(percentDV: number): string {
  if (percentDV < 50) return '#ef4444'
  if (percentDV < 80) return '#f59e0b'
  if (percentDV <= 150) return '#22c55e'
  return '#3b82f6'
}

export function NutrientsSection({ range }: NutrientsSectionProps) {
  const [data, setData] = useState<NutrientReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchNutrients = useCallback(async (r: ReportRange) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/log/report/nutrients?range=${r}`)
      if (res.ok) {
        const report: NutrientReportData = await res.json()
        setData(report)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNutrients(range)
  }, [range, fetchNutrients])

  const vitamins = useMemo(
    () => data?.nutrients.filter((n) => n.category === 'vitamin') ?? [],
    [data],
  )

  const minerals = useMemo(
    () => data?.nutrients.filter((n) => n.category === 'mineral') ?? [],
    [data],
  )

  const deficiencyCount = useMemo(
    () => data?.nutrients.filter((n) => n.percentDV < 50).length ?? 0,
    [data],
  )

  if (loading && !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
      </div>
    )
  }

  if (!data || data.days_with_data === 0) {
    return (
      <Card className="border-[#1e293b] bg-[#0f172a]">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Pill className="mb-3 h-10 w-10 text-[#64748b]" />
          <p className="text-sm font-medium text-[#f8fafc]">No nutrient data for this period</p>
          <p className="mt-1 text-xs text-[#64748b]">Log foods with detailed nutrition to see your micronutrient intake</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {deficiencyCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#ef4444]" />
          <p className="text-sm text-[#ef4444]">
            {deficiencyCount} nutrient{deficiencyCount === 1 ? '' : 's'} below 50% of daily value
          </p>
        </div>
      )}

      <p className="text-xs text-[#64748b]">
        Daily averages based on {data.days_with_data} day{data.days_with_data === 1 ? '' : 's'} with data
      </p>

      <NutrientGroup title="Vitamins" nutrients={vitamins} />
      <NutrientGroup title="Minerals" nutrients={minerals} />
    </div>
  )
}

function NutrientGroup({ title, nutrients }: { title: string; nutrients: NutrientReportEntry[] }) {
  if (nutrients.length === 0) return null

  return (
    <Card className="border-[#1e293b] bg-[#0f172a]">
      <CardHeader>
        <CardTitle className="text-base text-[#f8fafc]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {nutrients.map((n) => (
          <NutrientBar key={n.key} nutrient={n} />
        ))}
      </CardContent>
    </Card>
  )
}

function NutrientBar({ nutrient }: { nutrient: NutrientReportEntry }) {
  const color = getStatusColor(nutrient.percentDV)
  const clampedPercent = Math.min(nutrient.percentDV, 100)

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-[#94a3b8]">{nutrient.label}</span>
        <span className="text-[#f8fafc]">
          {nutrient.dailyAverage}{nutrient.unit}
          <span className="ml-1 text-[#64748b]">({nutrient.percentDV}% DV)</span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#020817]">
        <div
          role="progressbar"
          aria-valuenow={nutrient.dailyAverage}
          aria-valuemax={nutrient.dailyValue}
          aria-label={`${nutrient.label} ${nutrient.percentDV}% of daily value`}
          className="h-full rounded-full transition-all duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${clampedPercent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
