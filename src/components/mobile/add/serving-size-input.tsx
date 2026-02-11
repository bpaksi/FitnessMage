'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const UNITS = [
  'serving',
  'oz',
  'cup',
  'tbsp',
  'tsp',
  'g',
  'ml',
  'piece',
  'slice',
  'bowl',
  'scoop',
] as const

const FRACTION_PILLS = ['1/4', '1/3', '1/2', '2/3', '3/4', '1', '1.5', '2'] as const

interface ServingSizeInputProps {
  value: string
  onChange: (value: string) => void
}

function parseServingSize(raw: string): { quantity: string; unit: string } {
  const trimmed = raw.trim()
  for (const u of UNITS) {
    if (trimmed.endsWith(u)) {
      const q = trimmed.slice(0, -u.length).trim()
      return { quantity: q || '1', unit: u }
    }
  }
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    const lastWord = parts[parts.length - 1].toLowerCase()
    const matched = UNITS.find((u) => u === lastWord)
    if (matched) {
      return { quantity: parts.slice(0, -1).join(' ') || '1', unit: matched }
    }
  }
  return { quantity: trimmed || '1', unit: 'serving' }
}

export function ServingSizeInput({ value, onChange }: ServingSizeInputProps) {
  const { quantity, unit } = parseServingSize(value)

  function update(newQuantity: string, newUnit: string) {
    onChange(`${newQuantity} ${newUnit}`.trim())
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={quantity}
          onChange={(e) => update(e.target.value, unit)}
          placeholder="1"
          className="flex-1 border-[#1e293b] bg-[#020817] text-[#f8fafc]"
          inputMode="decimal"
        />
        <Select value={unit} onValueChange={(u) => update(quantity, u)}>
          <SelectTrigger className="w-28 border-[#1e293b] bg-[#020817] text-[#f8fafc]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" className="border-[#1e293b] bg-[#0f172a]">
            {UNITS.map((u) => (
              <SelectItem key={u} value={u} className="text-[#f8fafc]">
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FRACTION_PILLS.map((frac) => (
          <button
            key={frac}
            type="button"
            onClick={() => update(frac, unit)}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
              quantity === frac
                ? 'border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]'
                : 'border-[#1e293b] text-[#94a3b8] hover:border-[#3b82f6]/50'
            }`}
          >
            {frac}
          </button>
        ))}
      </div>
    </div>
  )
}
