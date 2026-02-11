'use client'

import { useEffect, useRef } from 'react'

/**
 * Polls /api/version when the PWA resumes from background.
 * If the build ID changed, hard-reloads to pick up new JS.
 */
export function VersionCheck() {
  const buildIdRef = useRef<string | null>(null)

  useEffect(() => {
    async function fetchBuildId() {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' })
        const { buildId } = await res.json()
        return buildId as string
      } catch {
        return null
      }
    }

    // Capture current build ID on mount
    fetchBuildId().then((id) => {
      buildIdRef.current = id
    })

    function onVisibilityChange() {
      if (document.visibilityState !== 'visible') return

      fetchBuildId().then((id) => {
        if (id && buildIdRef.current && id !== buildIdRef.current) {
          window.location.reload()
        }
      })
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return null
}
