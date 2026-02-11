'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-sm font-medium ${
        isActive
          ? 'bg-[#0f172a] text-[#f8fafc]'
          : 'text-[#94a3b8] hover:bg-[#0f172a]/50'
      }`}
    >
      {children}
    </Link>
  )
}
