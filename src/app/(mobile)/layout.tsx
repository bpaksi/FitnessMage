'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getDeviceToken } from '@/lib/mobile/token-store'
import { MobileProvider } from '@/contexts/mobile-context'

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLinkPage = pathname === '/link'

  // null = not yet checked (SSR / first render), true/false = client-side result
  const [hasToken, setHasToken] = useState<boolean | null>(null)

  useEffect(() => {
    setHasToken(getDeviceToken() !== null)
  }, [])

  useEffect(() => {
    if (hasToken === false && !isLinkPage) {
      router.replace('/link')
    }
  }, [hasToken, isLinkPage, router])

  // Before hydration or while checking token — show consistent dark bg (no flash)
  if (hasToken === null || (hasToken === false && !isLinkPage)) {
    return <div className="min-h-svh bg-[#020817]" />
  }

  return (
    <MobileProvider>
      <div className="mx-auto min-h-svh max-w-md bg-[#020817]">{children}</div>
    </MobileProvider>
  )
}
