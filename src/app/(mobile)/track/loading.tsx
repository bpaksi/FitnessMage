export default function TrackLoading() {
  return (
    <div className="flex min-h-svh flex-col bg-[#020817] px-4 pt-16">
      <div className="mb-4 h-5 w-16 animate-pulse rounded bg-[#0f172a]" />
      <div className="mb-6 flex justify-between">
        <div className="h-9 w-9 animate-pulse rounded-full bg-[#0f172a]" />
        <div className="h-5 w-20 animate-pulse rounded bg-[#0f172a]" />
        <div className="h-9 w-9 animate-pulse rounded-full bg-[#0f172a]" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-[#0f172a]" />
        ))}
      </div>
    </div>
  )
}
