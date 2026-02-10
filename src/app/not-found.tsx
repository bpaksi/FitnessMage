import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#020817] px-4">
      <span className="mb-4 text-6xl font-light text-[#1e293b]">404</span>
      <h2 className="mb-2 text-lg font-medium text-[#f8fafc]">Page not found</h2>
      <p className="mb-6 text-center text-sm text-[#64748b]">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button asChild className="bg-[#3b82f6] text-white hover:bg-[#2563eb]">
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  )
}
