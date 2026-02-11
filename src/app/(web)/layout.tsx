import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NoDevicesBanner } from '@/components/web/no-devices-banner'
import { SideNav } from '@/components/web/side-nav'

export default async function WebLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/landing')

  const admin = createAdminClient()
  const { count } = await admin
    .from('device_tokens')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('revoked', false)
    .not('last_active_at', 'is', null)

  const hasDevices = (count ?? 0) > 0

  return (
    <div className="flex min-h-svh bg-[#020817]">
      <Suspense
        fallback={<div className="w-56 shrink-0 border-r border-[#1e293b] bg-[#020817]" />}
      >
        <SideNav />
      </Suspense>
      <main className="flex-1 overflow-y-auto p-8">
        {!hasDevices && <NoDevicesBanner />}
        {children}
      </main>
    </div>
  )
}
