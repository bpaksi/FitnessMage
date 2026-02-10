export default function AddLoading() {
  return (
    <div className="flex min-h-svh flex-col bg-[#020817] px-4 pt-16">
      <div className="mb-4 h-5 w-20 animate-pulse rounded bg-[#0f172a]" />
      <div className="mb-4 h-10 w-full animate-pulse rounded-md bg-[#0f172a]" />
      <div className="mb-4 h-10 w-full animate-pulse rounded-md bg-[#0f172a]" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-[#0f172a]" />
        ))}
      </div>
    </div>
  )
}
