'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ReportRange } from '@/lib/types/report'

const RANGE_OPTIONS: { value: ReportRange; label: string }[] = [
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_30_days', label: 'Last 30 Days' },
]

interface RangeSelectorProps {
  range: ReportRange
  onRangeChange: (r: ReportRange) => void
}

export function RangeSelector({ range, onRangeChange }: RangeSelectorProps) {
  return (
    <Select value={range} onValueChange={(v) => onRangeChange(v as ReportRange)}>
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
  )
}
