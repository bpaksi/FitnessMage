'use client'

import { useMobileContext } from '@/contexts/mobile-context'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (dateStr === today.toISOString().split('T')[0]) return 'Today'
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday'

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function vibrate() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(50)
  }
}

export function DatePicker() {
  const { selectedDate, setSelectedDate } = useMobileContext()

  function navigate(offset: number) {
    const date = new Date(selectedDate + 'T12:00:00')
    date.setDate(date.getDate() + offset)
    const today = new Date().toISOString().split('T')[0]
    const newDate = date.toISOString().split('T')[0]
    if (newDate > today) return
    setSelectedDate(newDate)
    vibrate()
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => navigate(-1)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#94a3b8] transition-colors hover:bg-[#0f172a]"
        aria-label="Previous day"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <span className="text-sm font-medium text-[#f8fafc]">{formatDate(selectedDate)}</span>

      <button
        onClick={() => navigate(1)}
        disabled={isToday}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#94a3b8] transition-colors hover:bg-[#0f172a] disabled:opacity-30"
        aria-label="Next day"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
