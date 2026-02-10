import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-[#020817] px-4 pb-20">
      {/* Logo */}
      <div className="mb-8">
        <Image src="/logo-white.png" alt="Fitness Mage" width={180} height={60} priority />
      </div>

      <div className="w-full max-w-sm">{children}</div>

      {/* Pinned tagline footer */}
      <footer className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <Image src="/tagline-white.png" alt="Fitness Mage tagline" width={200} height={24} />
      </footer>
    </div>
  )
}
