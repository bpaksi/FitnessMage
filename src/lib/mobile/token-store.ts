const TOKEN_KEY = 'fitness-mage-device-token'
const COOKIE_NAME = 'device-token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function getDeviceToken(): string | null {
  if (typeof window === 'undefined') return null

  // Try localStorage first
  const fromStorage = localStorage.getItem(TOKEN_KEY)
  if (fromStorage) return fromStorage

  // Fallback to cookie (survives Safari → standalone PWA transition on iOS 17.4+)
  const fromCookie = getCookie(COOKIE_NAME)
  if (fromCookie) {
    // Sync back to localStorage for future reads
    localStorage.setItem(TOKEN_KEY, fromCookie)
    return fromCookie
  }

  return null
}

export function setDeviceToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export function clearDeviceToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}
