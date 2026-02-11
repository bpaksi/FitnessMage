'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { BarChart3, UtensilsCrossed, Smartphone, Settings, ArrowLeft } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { href: '/devices', label: 'Devices', icon: Smartphone },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

const SETTINGS_SECTIONS = [
  { section: 'daily-goals', label: 'Daily Goals' },
  { section: 'preferences', label: 'Preferences' },
  { section: 'data', label: 'Data Management' },
] as const

export function SideNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const onSettings = pathname.startsWith('/settings')
  const activeSection = searchParams.get('section') ?? 'daily-goals'

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[#1e293b] bg-[#020817]">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/reports" className="text-lg font-light tracking-tight text-[#f8fafc]">
          Fitness<span className="font-medium text-[#3b82f6]"> Mage</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {onSettings ? (
          <>
            <Link
              href="/reports"
              className="mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#94a3b8] hover:bg-[#0f172a]/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            {SETTINGS_SECTIONS.map(({ section, label }) => (
              <Link
                key={section}
                href={`/settings?section=${section}`}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  activeSection === section
                    ? 'bg-[#3b82f6]/10 text-[#3b82f6]'
                    : 'text-[#94a3b8] hover:bg-[#0f172a]/50'
                }`}
              >
                {label}
              </Link>
            ))}
          </>
        ) : (
          NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-[#0f172a] text-[#f8fafc]'
                    : 'text-[#94a3b8] hover:bg-[#0f172a]/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })
        )}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-[#1e293b] px-3 py-4">
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm text-[#64748b] hover:bg-[#0f172a]/50 hover:text-[#94a3b8]"
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
