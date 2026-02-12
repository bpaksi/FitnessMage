'use client'

import { useState, useEffect, useRef } from 'react'
import {
  parseServingSize,
  amountToServings,
  servingsToAmount,
  formatAmount,
  getDefaultStep,
} from '@/lib/utils/serving-size'

interface AmountInputProps {
  servingSize: string | null | undefined
  servings: number
  onServingsChange: (servings: number) => void
}

export function AmountInput({ servingSize, servings, onServingsChange }: AmountInputProps) {
  const parsed = parseServingSize(servingSize)

  if (!parsed.parseable) {
    return (
      <ServingsStepper
        servings={servings}
        onServingsChange={onServingsChange}
      />
    )
  }

  return (
    <AmountStepper
      baseQuantity={parsed.quantity}
      unit={parsed.unit}
      servings={servings}
      onServingsChange={onServingsChange}
    />
  )
}

/** Formatted button label for the confirm button. */
export function getAmountLabel(servingSize: string | null | undefined, servings: number): string {
  const parsed = parseServingSize(servingSize)
  if (!parsed.parseable) {
    return `${servings} serving${servings !== 1 ? 's' : ''}`
  }
  const amount = servingsToAmount(servings, parsed.quantity)
  return formatAmount(amount, parsed.unit)
}

/** Format display for track screen: returns "6.4 oz" or null if not parseable */
export function getDisplayAmount(servingSize: string | null | undefined, servings: number): string | null {
  const parsed = parseServingSize(servingSize)
  if (!parsed.parseable) return null
  const amount = servingsToAmount(servings, parsed.quantity)
  return formatAmount(amount, parsed.unit)
}

// --- Amount mode: shows input in food's native unit ---

interface AmountStepperProps {
  baseQuantity: number
  unit: string
  servings: number
  onServingsChange: (servings: number) => void
}

function AmountStepper({ baseQuantity, unit, servings, onServingsChange }: AmountStepperProps) {
  const step = getDefaultStep(baseQuantity)
  const amount = servingsToAmount(servings, baseQuantity)
  const [inputValue, setInputValue] = useState(formatNum(amount))
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync input when servings change externally
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setInputValue(formatNum(servingsToAmount(servings, baseQuantity)))
    }
  }, [servings, baseQuantity])

  function formatNum(n: number): string {
    return Number.isInteger(n) ? n.toString() : parseFloat(n.toFixed(2)).toString()
  }

  function commitValue(val: string) {
    const num = parseFloat(val)
    if (isNaN(num) || num <= 0) {
      // Reset to current
      setInputValue(formatNum(amount))
      return
    }
    const newServings = amountToServings(num, baseQuantity)
    onServingsChange(Math.round(newServings * 1000) / 1000)
    setInputValue(formatNum(num))
  }

  function adjust(delta: number) {
    const newAmount = Math.max(step, Math.round((amount + delta) * 100) / 100)
    const newServings = amountToServings(newAmount, baseQuantity)
    onServingsChange(Math.round(newServings * 1000) / 1000)
  }

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <button
        onClick={() => adjust(-step)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e293b] text-lg text-[#94a3b8]"
        aria-label={`Decrease by ${step} ${unit}`}
      >
        &minus;
      </button>
      <div className="flex items-baseline gap-1.5">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={(e) => commitValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur()
            }
          }}
          className="w-16 bg-transparent text-center text-2xl font-light tabular-nums text-[#f8fafc] outline-none focus:border-b focus:border-[#3b82f6]"
          aria-label={`Amount in ${unit}`}
        />
        <span className="text-sm text-[#64748b]">{unit}</span>
      </div>
      <button
        onClick={() => adjust(step)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e293b] text-lg text-[#94a3b8]"
        aria-label={`Increase by ${step} ${unit}`}
      >
        +
      </button>
    </div>
  )
}

// --- Fallback servings stepper (existing behavior) ---

interface ServingsStepperProps {
  servings: number
  onServingsChange: (servings: number) => void
}

function ServingsStepper({ servings, onServingsChange }: ServingsStepperProps) {
  function adjust(delta: number) {
    onServingsChange(Math.max(0.25, Math.round((servings + delta) * 4) / 4))
  }

  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <button
        onClick={() => adjust(-0.25)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e293b] text-lg text-[#94a3b8]"
        aria-label="Decrease servings"
      >
        &minus;
      </button>
      <span className="min-w-[60px] text-center text-2xl font-light tabular-nums text-[#f8fafc]">
        {servings}
      </span>
      <button
        onClick={() => adjust(0.25)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e293b] text-lg text-[#94a3b8]"
        aria-label="Increase servings"
      >
        +
      </button>
    </div>
  )
}
