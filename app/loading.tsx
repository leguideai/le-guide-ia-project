import { Sparkles } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3F] flex flex-col selection:bg-primary selection:text-white font-sans overflow-x-hidden">
      {/* Header Skeleton */}
      <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur px-4 sm:px-8 flex items-center justify-between shrink-0 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-[#EEF3FF]" />
          <div className="h-5 w-28 bg-[#EEF3FF] rounded-md" />
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="h-4 w-16 bg-[#F5F8FF] rounded" />
          <div className="h-4 w-20 bg-[#F5F8FF] rounded" />
          <div className="h-4 w-24 bg-[#F5F8FF] rounded" />
          <div className="h-4 w-16 bg-[#F5F8FF] rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 bg-[#EEF3FF] rounded-xl" />
        </div>
      </header>

      {/* Main Skeleton */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16 space-y-10 animate-pulse">
        {/* Hero Top Pill & Heading */}
        <div className="space-y-4 max-w-2xl">
          <div className="h-7 w-44 bg-[#EEF3FF] rounded-full" />
          <div className="space-y-2.5">
            <div className="h-10 sm:h-12 w-full bg-[#EEF3FF] rounded-2xl" />
            <div className="h-10 sm:h-12 w-3/4 bg-[#EEF3FF] rounded-2xl" />
          </div>
          <div className="h-4 w-full bg-[#F5F8FF] rounded-lg" />
          <div className="h-4 w-4/5 bg-[#F5F8FF] rounded-lg" />
        </div>

        {/* 3 Grid Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-200 bg-[#F5F8FF] p-6 space-y-5"
            >
              <div className="w-full aspect-video rounded-2xl bg-[#F5F8FF] border border-slate-200/70 flex items-center justify-center">
                <Sparkles className="size-8 text-[#0E1E3F]/10 animate-pulse" />
              </div>
              <div className="space-y-2.5">
                <div className="h-5 w-3/4 bg-[#EEF3FF] rounded-lg" />
                <div className="h-3.5 w-full bg-[#F5F8FF] rounded" />
                <div className="h-3.5 w-2/3 bg-[#F5F8FF] rounded" />
              </div>
              <div className="h-11 w-full bg-[#EEF3FF] rounded-xl mt-4" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
