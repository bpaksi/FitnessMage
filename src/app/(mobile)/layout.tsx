'use client'

import { Suspense, useEffect, useSyncExternalStore } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getDeviceToken } from '@/lib/mobile/token-store'
import { MobileProvider } from '@/contexts/mobile-context'
import { VersionCheck } from '@/components/mobile/version-check'

const subscribe = () => () => {}

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLinkPage = pathname === '/link'

  // null = not yet checked (SSR/hydration), true/false = client-side result
  const hasToken = useSyncExternalStore<boolean | null>(
    subscribe,
    () => getDeviceToken() !== null,
    () => null,
  )

  useEffect(() => {
    if (hasToken === false && !isLinkPage) {
      router.replace('/link')
    }
  }, [hasToken, isLinkPage, router])

  if (hasToken === null || (!hasToken && !isLinkPage)) {
    return <div className="min-h-svh bg-[#020817]" />
  }

  return (
    <MobileProvider>
      <VersionCheck />
      <div className="mx-auto min-h-svh max-w-md bg-[#020817]">
        <Suspense>{children}</Suspense>
      </div>
    </MobileProvider>
  )
}
