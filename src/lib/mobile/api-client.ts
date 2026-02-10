import { getDeviceToken, clearDeviceToken } from './token-store'

interface ApiClientOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
}

export async function apiClient<T>(url: string, options: ApiClientOptions = {}): Promise<T> {
  const token = getDeviceToken()
  const { method = 'GET', body, headers = {} } = options

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (res.status === 401) {
    clearDeviceToken()
    if (window.location.pathname !== '/link') {
      window.location.href = '/link'
    }
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }

  return res.json()
}
