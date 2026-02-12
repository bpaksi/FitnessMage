export interface ParsedServingSize {
  quantity: number
  unit: string
  parseable: true
}

export interface UnparseableServingSize {
  parseable: false
}

export type ServingSizeResult = ParsedServingSize | UnparseableServingSize

const KNOWN_UNITS = [
  'oz', 'g', 'mg', 'kg', 'lb', 'lbs',
  'ml', 'l', 'fl oz',
  'cup', 'cups', 'tbsp', 'tsp',
  'piece', 'pieces', 'slice', 'slices',
  'scoop', 'scoops', 'serving', 'servings',
  'capsule', 'capsules', 'tablet', 'tablets', 'softgel', 'softgels',
  'bowl', 'bar', 'packet', 'pouch',
]

const FRACTION_MAP: Record<string, number> = {
  '1/8': 0.125,
  '1/4': 0.25,
  '1/3': 1 / 3,
  '3/8': 0.375,
  '1/2': 0.5,
  '5/8': 0.625,
  '2/3': 2 / 3,
  '3/4': 0.75,
  '7/8': 0.875,
}

function parseFraction(s: string): number | null {
  if (FRACTION_MAP[s] != null) return FRACTION_MAP[s]
  const num = parseFloat(s)
  return isNaN(num) ? null : num
}

/**
 * Parse a serving_size string like "4oz", "100 g", "1/2 cup", "1 cup (240ml)"
 * into structured { quantity, unit, parseable } data.
 */
export function parseServingSize(raw: string | null | undefined): ServingSizeResult {
  if (!raw) return { parseable: false }

  // Strip parenthetical suffixes: "1 cup (240ml)" → "1 cup"
  let cleaned = raw.replace(/\s*\(.*?\)\s*/g, '').trim()
  if (!cleaned) return { parseable: false }

  // Normalize: lowercase, collapse whitespace
  cleaned = cleaned.toLowerCase().replace(/\s+/g, ' ')

  // Try matching "quantity unit" patterns
  // Handle "fl oz" specially (two-word unit)
  const flOzMatch = cleaned.match(/^([\d./]+)\s*fl\s*oz$/)
  if (flOzMatch) {
    const qty = parseFraction(flOzMatch[1])
    if (qty != null && qty > 0) return { quantity: qty, unit: 'fl oz', parseable: true }
  }

  // General pattern: optional number (possibly fraction) + unit
  const match = cleaned.match(/^([\d./]+)\s*(.+)$/)
  if (match) {
    const qty = parseFraction(match[1])
    const unitCandidate = match[2].trim()
    if (qty != null && qty > 0) {
      const matchedUnit = KNOWN_UNITS.find((u) => u === unitCandidate)
      if (matchedUnit) return { quantity: qty, unit: matchedUnit, parseable: true }
    }
  }

  // Try without space: "4oz" → quantity=4, unit="oz"
  const noSpaceMatch = cleaned.match(/^([\d./]+)([a-z]+)$/)
  if (noSpaceMatch) {
    const qty = parseFraction(noSpaceMatch[1])
    const unitCandidate = noSpaceMatch[2]
    if (qty != null && qty > 0) {
      const matchedUnit = KNOWN_UNITS.find((u) => u === unitCandidate)
      if (matchedUnit) return { quantity: qty, unit: matchedUnit, parseable: true }
    }
  }

  return { parseable: false }
}

/** Convert a user-entered amount to a servings multiplier. */
export function amountToServings(enteredAmount: number, baseQuantity: number): number {
  if (baseQuantity <= 0) return 1
  return enteredAmount / baseQuantity
}

/** Convert a servings multiplier back to a display amount. */
export function servingsToAmount(servings: number, baseQuantity: number): number {
  return servings * baseQuantity
}

/** Format an amount with its unit for display: "6.4 oz" */
export function formatAmount(amount: number, unit: string): string {
  // Remove unnecessary trailing zeros: 6.0 → "6", 6.4 → "6.4"
  const formatted = Number.isInteger(amount) ? amount.toString() : parseFloat(amount.toFixed(2)).toString()
  return `${formatted} ${unit}`
}

/** Determine a smart step size for +/- buttons based on the base quantity. */
export function getDefaultStep(baseQuantity: number): number {
  if (baseQuantity >= 50) return 10
  if (baseQuantity >= 10) return 5
  if (baseQuantity >= 2) return 1
  if (baseQuantity >= 0.5) return 0.25
  return 0.5
}
