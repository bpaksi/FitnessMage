export default function HomeLoading() {
  return (
    <div className="flex min-h-svh flex-col bg-[#020817] px-4 pt-16">
      <div className="mb-6 h-5 w-28 animate-pulse rounded bg-[#0f172a]" />
      <div className="mb-8 flex justify-between">
        <div className="h-9 w-9 animate-pulse rounded-full bg-[#0f172a]" />
        <div className="h-5 w-20 animate-pulse rounded bg-[#0f172a]" />
        <div className="h-9 w-9 animate-pulse rounded-full bg-[#0f172a]" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-16 animate-pulse rounded bg-[#0f172a]" />
              <div className="h-3 w-32 animate-pulse rounded bg-[#0f172a]" />
            </div>
            <div className="h-2.5 w-full animate-pulse rounded-full bg-[#0f172a]" />
          </div>
        ))}
      </div>
    </div>
  )
}
