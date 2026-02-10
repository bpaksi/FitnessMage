'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: string
  message: string
  ctaLabel?: string
  ctaHref?: string
}

export function EmptyState({ icon, message, ctaLabel, ctaHref }: EmptyStateProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="mb-3 text-4xl" role="img" aria-hidden="true">
        {icon}
      </span>
      <p className="mb-4 text-sm text-[#64748b]">{message}</p>
      {ctaLabel && ctaHref && (
        <Button
          onClick={() => router.push(ctaHref)}
          className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
        >
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
