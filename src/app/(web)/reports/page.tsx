'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ReportData, ReportRange } from '@/lib/types/report'

const RANGE_OPTIONS: { value: ReportRange; label: string }[] = [
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_30_days', label: 'Last 30 Days' },
]

export default function ReportsPage() {
  const [range, setRange] = useState<ReportRange>('this_week')
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = useCallback(async (r: ReportRange) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/log/report?range=${r}`)
      if (res.ok) {
        const report: ReportData = await res.json()
        setData(report)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReport(range)
  }, [range, fetchReport])

  const chartData = useMemo(
    () =>
      data?.daily_totals.map((d) => ({
        date: d.date.slice(5), // MM-DD
        calories: d.totals.calories,
        protein: d.totals.protein,
        carbs: d.totals.carbs,
        fat: d.totals.fat,
      })) || [],
    [data],
  )

  const goalAchievement = useMemo(() => {
    if (!data || data.daily_totals.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }
    const total = data.daily_totals.length
    const met = {
      calories: data.daily_totals.filter((d) => d.totals.calories >= data.goals.calories * 0.9).length,
      protein: data.daily_totals.filter((d) => d.totals.protein >= data.goals.protein * 0.9).length,
      carbs: data.daily_totals.filter((d) => d.totals.carbs >= data.goals.carbs * 0.9).length,
      fat: data.daily_totals.filter((d) => d.totals.fat >= data.goals.fat * 0.9).length,
    }
    return {
      calories: Math.round((met.calories / total) * 100),
      protein: Math.round((met.protein / total) * 100),
      carbs: Math.round((met.carbs / total) * 100),
      fat: Math.round((met.fat / total) * 100),
    }
  }, [data])

  const streak = useMemo(() => {
    if (!data || data.daily_totals.length === 0) return 0
    let count = 0
    const sorted = [...data.daily_totals].sort((a, b) => b.date.localeCompare(a.date))
    for (const d of sorted) {
      if (d.totals.calories >= data.goals.calories * 0.9) {
        count++
      } else {
        break
      }
    }
    return count
  }, [data])

  if (loading && !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-tight text-[#f8fafc]">Reports</h1>
        <Select value={range} onValueChange={(v) => setRange(v as ReportRange)}>
          <SelectTrigger className="w-44 border-[#1e293b] bg-[#0f172a] text-[#f8fafc]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-[#1e293b] bg-[#0f172a]">
            {RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-[#f8fafc]">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Macro Trends */}
      <Card className="border-[#1e293b] bg-[#0f172a]">
        <CardHeader>
          <CardTitle className="text-base text-[#f8fafc]">Calorie Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#64748b]">No data for this period</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Goal Achievement */}
        <Card className="border-[#1e293b] bg-[#0f172a]">
          <CardHeader>
            <CardTitle className="text-base text-[#f8fafc]">Goal Achievement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data && data.daily_totals.length > 0 ? (
              <>
                <GoalBar label="Calories" percent={goalAchievement.calories} color="#22c55e" />
                <GoalBar label="Protein" percent={goalAchievement.protein} color="#ef4444" />
                <GoalBar label="Carbs" percent={goalAchievement.carbs} color="#3b82f6" />
                <GoalBar label="Fat" percent={goalAchievement.fat} color="#eab308" />
              </>
            ) : (
              <p className="py-4 text-center text-sm text-[#64748b]">No data for this period</p>
            )}
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="border-[#1e293b] bg-[#0f172a]">
          <CardHeader>
            <CardTitle className="text-base text-[#f8fafc]">Current Streak</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Flame className="mb-2 h-10 w-10 text-[#f59e0b]" />
            <p className="text-4xl font-bold text-[#f8fafc]">{streak}</p>
            <p className="text-sm text-[#64748b]">
              {streak === 1 ? 'day' : 'days'} hitting calorie goal
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function GoalBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-[#94a3b8]">{label}</span>
        <span className="text-[#f8fafc]">{percent}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#020817]">
        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemax={100}
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
