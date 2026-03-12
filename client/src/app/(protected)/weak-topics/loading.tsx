import { Skeleton } from "@/components/ui/skeleton";

export default function WeakTopicsLoading() {
  return (
    <div className="min-h-full w-full h-screen bg-zinc-50 pb-20 dark:bg-black relative overflow-hidden pt-8 sm:pt-12">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <svg
          className="absolute left-0 top-0 h-full w-full opacity-30 dark:opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="weak-topics-grid-loading" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-200 dark:text-zinc-800" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#weak-topics-grid-loading)" />
        </svg>
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-rose-500/10 blur-[120px] dark:bg-rose-600/10" />
        <div className="absolute top-1/2 right-0 h-100 w-100 -translate-y-1/2 translate-x-1/3 rounded-full bg-amber-500/10 blur-[120px] dark:bg-amber-600/10" />
      </div>

      <div className="relative z-10 space-y-10 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 pb-12 animate-pulse pt-6">
      <div className="space-y-3">
        <Skeleton className="h-9 w-44 rounded-xl" />
        <Skeleton className="h-4 w-64 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
    </div>
    </div>
  );
}
