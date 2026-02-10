'use client'

import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#020817] px-4">
      <span className="mb-4 text-4xl">⚠️</span>
      <h2 className="mb-2 text-lg font-medium text-[#f8fafc]">Something went wrong</h2>
      <p className="mb-6 text-center text-sm text-[#64748b]">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={reset} className="bg-[#3b82f6] text-white hover:bg-[#2563eb]">
        Try Again
      </Button>
    </div>
  )
}
