'use client'

import { useRouter } from 'next/navigation'
import { useMobileContext } from '@/contexts/mobile-context'
import { StatusCell } from './status-cell'

interface DayData {
  date: string
  totals: { calories: number; protein: number; carbs: number; fat: number; water: number } | null
}

interface WeekGridProps {
  days: DayData[]
  goals: { calories: number; protein: number; carbs: number; fat: number; water: number }
}

const MACRO_ROWS = [
  { key: 'calories' as const, label: 'Cal', color: '#22c55e' },
  { key: 'protein' as const, label: 'Pro', color: '#ef4444' },
  { key: 'carbs' as const, label: 'Carb', color: '#3b82f6' },
  { key: 'fat' as const, label: 'Fat', color: '#eab308' },
  { key: 'water' as const, label: 'Water', color: '#38bdf8' },
]

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)
}

export function WeekGrid({ days, goals }: WeekGridProps) {
  const router = useRouter()
  const { setSelectedDate } = useMobileContext()
  const today = new Date().toISOString().split('T')[0]

  function handleDayTap(date: string) {
    if (date > today) return
    setSelectedDate(date)
    router.push('/track')
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="w-12 py-2 text-left text-[10px] font-normal text-[#475569]" />
            {days.map((day) => {
              const isToday = day.date === today
              return (
                <th
                  key={day.date}
                  className="py-2 text-center"
                >
                  <button
                    onClick={() => handleDayTap(day.date)}
                    className={`inline-flex flex-col items-center gap-0.5 rounded-md px-2 py-1 transition-colors ${
                      isToday
                        ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                        : 'text-[#94a3b8] hover:bg-[#0f172a]'
                    } ${day.date > today ? 'pointer-events-none opacity-40' : ''}`}
                  >
                    <span className="text-[10px] font-medium">{getDayLabel(day.date)}</span>
                    <span className="text-[10px]">{new Date(day.date + 'T12:00:00').getDate()}</span>
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {MACRO_ROWS.map((macro) => (
            <tr key={macro.key}>
              <td className="py-2 text-[10px] font-medium text-[#64748b]">{macro.label}</td>
              {days.map((day) => (
                <td key={day.date} className="py-2 text-center">
                  <StatusCell
                    value={day.totals ? day.totals[macro.key] : null}
                    goal={goals[macro.key]}
                    isToday={day.date === today}
                    isFuture={day.date > today}
                    color={macro.color}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
