// In-memory sliding window for local dev
// Upstash integration deferred until production deployment
const inMemoryStore = new Map<string, { count: number; resetAt: number }>()

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
}

export function createRateLimiter(options: RateLimitOptions) {
  const { maxRequests, windowMs } = options

  return async (identifier: string): Promise<RateLimitResult> => {
    const now = Date.now()
    const entry = inMemoryStore.get(identifier)

    if (!entry || now > entry.resetAt) {
      inMemoryStore.set(identifier, { count: 1, resetAt: now + windowMs })
      return { success: true, remaining: maxRequests - 1 }
    }

    if (entry.count >= maxRequests) {
      return { success: false, remaining: 0 }
    }

    entry.count++
    return { success: true, remaining: maxRequests - entry.count }
  }
}

export const verifyTokenLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60_000,
})

export const barcodeLimiter = createRateLimiter({
  maxRequests: 30,
  windowMs: 60_000,
})

export const pairingRequestLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 60_000,
})

export const pairingStatusLimiter = createRateLimiter({
  maxRequests: 60,
  windowMs: 60_000,
})

export const pairingClaimLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60_000,
})

export const usdaSearchLimiter = createRateLimiter({
  maxRequests: 15,
  windowMs: 60_000,
})
