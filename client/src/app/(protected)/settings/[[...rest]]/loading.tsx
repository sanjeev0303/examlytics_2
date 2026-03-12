import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="min-h-full w-full h-screen bg-zinc-50 dark:bg-black relative overflow-hidden pt-8 sm:pt-12">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <svg
          className="absolute left-0 top-0 h-full w-full opacity-30 dark:opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="settings-grid-loading" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-200 dark:text-zinc-800" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#settings-grid-loading)" />
        </svg>
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-600/10" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px] dark:bg-emerald-600/10" />
      </div>

      <div className="relative z-10 pt-4 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 pb-12 animate-pulse">
      <div className="space-y-3">
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-4 w-56 rounded-lg" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-lg" />
        ))}
      </div>

      {/* Settings form */}
      <div className="max-w-xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>

        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>
    </div>
    </div>
    </div>
  );
}
