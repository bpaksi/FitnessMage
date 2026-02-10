import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#020817] px-6 pb-20">
      {/* Logo */}
      <div className="absolute top-12 left-1/2 z-10 -translate-x-1/2">
        <Image src="/logo-white.png" alt="Fitness Mage" width={180} height={60} priority />
      </div>

      {/* Atmospheric glow orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,rgba(59,130,246,0.04)_40%,transparent_70%)] blur-[1px]" />
      </div>

      {/* Decorative macro dots */}
      <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+140px)]">
        <div className="flex items-center gap-2">
          <span className="block h-1 w-1 rounded-full bg-[#22c55e] opacity-60" />
          <span className="block h-1 w-1 rounded-full bg-[#ef4444] opacity-60" />
          <span className="block h-1 w-1 rounded-full bg-[#3b82f6] opacity-60" />
          <span className="block h-1 w-1 rounded-full bg-[#eab308] opacity-60" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="text-[clamp(2.5rem,8vw,4.5rem)] leading-[1.05] font-[275] tracking-[-0.04em] text-[#f8fafc]">
          Fitness
          <span className="font-[450] text-[#3b82f6]"> Mage</span>
        </h1>

        <p className="mt-4 max-w-xs text-[15px] leading-relaxed tracking-wide text-[#64748b]">
          Track your macros with magic
        </p>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button
            asChild
            size="lg"
            className="min-w-[160px] rounded-full bg-[#3b82f6] px-8 text-[13px] font-medium tracking-wide text-white transition-all hover:bg-[#2563eb] hover:shadow-[0_0_24px_rgba(59,130,246,0.25)]"
          >
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-w-[160px] rounded-full border-[#1e293b] bg-transparent px-8 text-[13px] font-medium tracking-wide text-[#94a3b8] transition-all hover:border-[#334155] hover:bg-[#0f172a] hover:text-[#f8fafc]"
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>

      {/* Pinned tagline footer */}
      <footer className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <Image src="/tagline-white.png" alt="Fitness Mage tagline" width={200} height={24} />
      </footer>
    </main>
  )
}
