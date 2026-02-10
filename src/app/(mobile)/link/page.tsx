'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { getDeviceToken, setDeviceToken, clearDeviceToken } from '@/lib/mobile/token-store'
import { usePwaInstall } from '@/hooks/use-pwa-install'
import { Button } from '@/components/ui/button'

type FlowState = 'checking' | 'landing' | 'code' | 'success'

export default function LinkPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { canInstall, triggerInstall, isStandalone, platform } = usePwaInstall()
  const pwaOverride = searchParams.get('pwa') === 'true'
  const effectiveStandalone = isStandalone || pwaOverride
  const [state, setState] = useState<FlowState>('checking')

  useEffect(() => {
    const token = getDeviceToken()
    if (!token) {
      setState('landing')
      return
    }

    fetch('/api/auth/validate', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          router.replace('/home')
        } else {
          clearDeviceToken()
          setState('landing')
        }
      })
      .catch(() => {
        // Network error — assume valid so user isn't stuck
        router.replace('/home')
      })
  }, [router])
  const [code, setCode] = useState('')
  const [token, setToken] = useState('')
  const [expiresAt, setExpiresAt] = useState<number>(0)
  const [remaining, setRemaining] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const requestCode = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { collectDeviceInfo } = await import('@/lib/mobile/device-info')
      const { device_name, device_type, device_info } = collectDeviceInfo()

      const res = await fetch('/api/auth/pairing/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_name, device_type, device_info }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to generate code')
        setLoading(false)
        return
      }

      const data = await res.json()
      setCode(data.code)
      setToken(data.token)
      setExpiresAt(Date.now() + 5 * 60 * 1000)
      setState('code')
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (state !== 'code' || !expiresAt) return
    function tick() {
      const diff = expiresAt - Date.now()
      if (diff <= 0) {
        setRemaining('Expired')
        if (pollRef.current) clearInterval(pollRef.current)
        return
      }
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setRemaining(`${mins}:${secs.toString().padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [state, expiresAt])

  // Poll for linked status
  useEffect(() => {
    if (state !== 'code' || !token) return

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/pairing/status', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        if (data.status === 'linked') {
          if (pollRef.current) clearInterval(pollRef.current)
          setDeviceToken(token)
          setState('success')
        } else if (data.status === 'expired') {
          if (pollRef.current) clearInterval(pollRef.current)
          setRemaining('Expired')
        }
      } catch {
        // Ignore polling errors
      }
    }, 2000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [state, token])

  // Auto-redirect after success
  useEffect(() => {
    if (state !== 'success') return
    const timeout = setTimeout(() => router.push('/home'), 1500)
    return () => clearTimeout(timeout)
  }, [state, router])

  const formatCode = (c: string) => `${c.slice(0, 3)} ${c.slice(3)}`

  // Splash while validating token
  if (state === 'checking') {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#020817]">
        <h1 className="text-xl font-light text-[#f8fafc]">
          Fitness<span className="font-medium text-[#3b82f6]"> Mage</span>
        </h1>
      </main>
    )
  }

  // State 3 — Success
  if (state === 'success') {
    return (
      <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#020817] px-6">
        <GlowOrb />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]/20">
            <svg className="h-8 w-8 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-[#f8fafc]">Device Linked!</p>
          <p className="text-sm text-[#64748b]">Redirecting...</p>
        </div>
      </main>
    )
  }

  // State 2 — Code display
  if (state === 'code') {
    const isExpired = remaining === 'Expired'
    return (
      <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#020817] px-6">
        <GlowOrb />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <h1 className="text-xl font-light text-[#f8fafc]">
            Fitness<span className="font-medium text-[#3b82f6]"> Mage</span>
          </h1>

          {isExpired ? (
            <>
              <p className="text-sm text-[#64748b]">Code expired</p>
              <Button
                onClick={requestCode}
                disabled={loading}
                className="min-w-[200px] rounded-full bg-[#3b82f6] px-8 text-[13px] font-medium text-white hover:bg-[#2563eb]"
              >
                {loading ? 'Generating...' : 'Generate New Code'}
              </Button>
            </>
          ) : (
            <>
              <p className="text-center text-sm text-[#64748b]">
                Enter this code at <span className="font-medium text-[#f8fafc]">fitnessmage.com</span>
              </p>
              <p className="font-mono text-4xl font-bold tracking-[0.3em] text-[#f8fafc]">
                {formatCode(code)}
              </p>
              <p className="text-xs text-[#64748b]">Expires in {remaining}</p>
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
              <p className="text-xs text-[#64748b]">Waiting for link...</p>
            </>
          )}

          {error && (
            <p className="rounded-md bg-red-500/10 px-4 py-2 text-center text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
      </main>
    )
  }

  // State 1 — Landing (default)
  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-[#020817] px-6 pb-[env(safe-area-inset-bottom,0px)]">
      {/* Logo — in normal flow so it doesn't overlap content when browser controls shrink viewport */}
      <div className="z-10 flex shrink-0 justify-center pt-12">
        <Image src="/logo-white.png" alt="Fitness Mage" width={180} height={60} priority />
      </div>

      <GlowOrb />
      <MacroDots />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-[clamp(2.5rem,8vw,4.5rem)] leading-[1.05] font-[275] tracking-[-0.04em] text-[#f8fafc]">
          Fitness
          <span className="font-[450] text-[#3b82f6]"> Mage</span>
        </h1>

        {/* PWA install guidance — only when not installed */}
        {!effectiveStandalone && (
          <div className="mt-6 max-w-xs space-y-3">
            {platform === 'ios' ? (
              <p className="text-[13px] leading-relaxed text-[#64748b]">
                Tap <span className="inline-flex items-center align-middle -translate-y-px text-[#f8fafc]">
                  <svg className="mx-0.5 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
                  </svg>
                  Share
                </span> then <span className="font-medium text-[#f8fafc]">Add to Home Screen</span> for the best experience.
              </p>
            ) : canInstall ? (
              <Button
                onClick={triggerInstall}
                className="w-full rounded-full bg-[#0f172a] border border-[#1e293b] px-8 text-[13px] font-medium text-[#f8fafc] hover:bg-[#1e293b]"
              >
                Install App
              </Button>
            ) : (
              <p className="text-[13px] leading-relaxed text-[#64748b]">
                For the best experience, add this page to your home screen.
              </p>
            )}
          </div>
        )}

        {/* Link Device — only available as PWA */}
        {effectiveStandalone && (
          <Button
            onClick={requestCode}
            disabled={loading}
            className="mt-8 min-w-[200px] rounded-full bg-[#3b82f6] px-8 text-[13px] font-medium text-white hover:bg-[#2563eb] hover:shadow-[0_0_24px_rgba(59,130,246,0.25)]"
          >
            {loading ? 'Linking...' : 'Link Device'}
          </Button>
        )}

        {error && (
          <p className="mt-4 rounded-md bg-red-500/10 px-4 py-2 text-center text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </main>
  )
}

function GlowOrb() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <div className="h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,rgba(59,130,246,0.04)_40%,transparent_70%)] blur-[1px]" />
    </div>
  )
}

function MacroDots() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+100px)]">
      <div className="flex items-center gap-2">
        <span className="block h-1 w-1 rounded-full bg-[#22c55e] opacity-60" />
        <span className="block h-1 w-1 rounded-full bg-[#ef4444] opacity-60" />
        <span className="block h-1 w-1 rounded-full bg-[#3b82f6] opacity-60" />
        <span className="block h-1 w-1 rounded-full bg-[#eab308] opacity-60" />
      </div>
    </div>
  )
}
