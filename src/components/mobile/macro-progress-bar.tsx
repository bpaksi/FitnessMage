'use client'

interface MacroProgressBarProps {
  label: string
  current: number
  goal: number
  color: string
  unit?: string
}

export function MacroProgressBar({ label, current, goal, color, unit = '' }: MacroProgressBarProps) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0
  const remaining = Math.max(goal - current, 0)
  const isOver = current > goal
  const isNearGoal = percentage >= 90

  const barColor = isOver ? '#f59e0b' : color
  const glowStyle = isNearGoal && !isOver ? { boxShadow: `0 0 12px ${color}40` } : {}

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">{label}</span>
        <span className="text-xs tabular-nums text-[#64748b]">
          {Math.round(current)}{unit} / {Math.round(goal)}{unit}
          <span className="ml-1 text-[#475569]">&middot; {Math.round(remaining)} left</span>
        </span>
      </div>
      <div
        className="relative h-2.5 overflow-hidden rounded-full bg-[#1e293b]"
        role="progressbar"
        aria-valuenow={Math.round(current)}
        aria-valuemax={goal}
        aria-label={`${label}: ${Math.round(current)} of ${goal}${unit}`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out motion-reduce:transition-none"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
            ...glowStyle,
          }}
        />
      </div>
    </div>
  )
}
