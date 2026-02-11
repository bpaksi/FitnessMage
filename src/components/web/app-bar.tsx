'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/reports', label: 'Reports' },
  { href: '/meals', label: 'Meals' },
  { href: '/settings', label: 'Settings' },
] as const

const SETTINGS_SECTIONS = [
  { section: 'daily-goals', label: 'Daily Goals' },
  { section: 'devices', label: 'Linked Devices' },
  { section: 'preferences', label: 'Preferences' },
  { section: 'data', label: 'Data Management' },
] as const

interface AppBarProps {
  hasDevices: boolean
}

export function AppBar({ hasDevices: _hasDevices }: AppBarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const onSettings = pathname.startsWith('/settings')
  const activeSection = searchParams.get('section') ?? 'daily-goals'

  return (
    <header className="border-b border-[#1e293b] bg-[#020817]">
      {/* Top row — logo + sign out */}
      <div className="flex items-center justify-between px-6 py-3">
        <Link href="/settings" className="text-lg font-light tracking-tight text-[#f8fafc]">
          Fitness<span className="font-medium text-[#3b82f6]"> Mage</span>
        </Link>
        <form action="/api/auth/signout" method="post">
          <button type="submit" className="text-sm text-[#64748b] hover:text-[#94a3b8]">
            Sign Out
          </button>
        </form>
      </div>

      {/* Primary nav */}
      <nav className="flex gap-1 px-6 pb-2">
        {NAV_ITEMS.map(({ href, label }) => {
          const isActive = href === '/settings' ? onSettings : pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-[#0f172a] text-[#f8fafc]'
                  : 'text-[#94a3b8] hover:bg-[#0f172a]/50'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Settings sub-nav */}
      {onSettings && (
        <nav className="flex gap-1 border-t border-[#1e293b] px-6 py-2">
          {SETTINGS_SECTIONS.map(({ section, label }) => (
            <Link
              key={section}
              href={`/settings?section=${section}`}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                activeSection === section
                  ? 'bg-[#3b82f6]/10 text-[#3b82f6]'
                  : 'text-[#64748b] hover:text-[#94a3b8]'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
