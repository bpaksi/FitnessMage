import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NoDevicesBanner } from '@/components/web/no-devices-banner'

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
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-[#1e293b] p-4">
        <Link href="/settings" className="mb-8 text-lg font-light tracking-tight text-[#f8fafc]">
          Fitness<span className="font-medium text-[#3b82f6]"> Mage</span>
        </Link>

        <nav className="flex flex-col gap-1">
          <Link
            href="/settings"
            className="rounded-md bg-[#0f172a] px-3 py-2 text-sm font-medium text-[#f8fafc]"
          >
            Settings
          </Link>
          <span className="cursor-not-allowed rounded-md px-3 py-2 text-sm text-[#334155]">
            Meals
          </span>
          <span className="cursor-not-allowed rounded-md px-3 py-2 text-sm text-[#334155]">
            Reports
          </span>
        </nav>

        <div className="mt-auto">
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2 text-left text-sm text-[#64748b] hover:text-[#94a3b8]"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">
        {!hasDevices && <NoDevicesBanner />}
        {children}
      </main>
    </div>
  )
}
