
import { Skeleton } from "@/components/ui/skeleton";

function CardShell({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 ${className}`}>
      {children}
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-full w-full bg-zinc-50 pb-20 dark:bg-black relative overflow-hidden pt-8">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <svg
          className="absolute left-0 top-0 h-full w-full opacity-30 dark:opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="dashboard-grid-loading" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-200 dark:text-zinc-800" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashboard-grid-loading)" />
        </svg>
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px] dark:bg-indigo-600/20" />
        <div className="absolute bottom-64 right-10 h-80 w-80 rounded-full bg-emerald-500/20 blur-[100px] dark:bg-emerald-600/20" />
      </div>

      <div className="relative z-10 pt-4 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-44 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="hidden md:flex gap-3">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* ── Stats row: 4 columns (matches DashboardLayout stats grid) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Col 1 – Learning Health Index */}
        <CardShell className="flex flex-col items-center justify-center gap-3 py-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </CardShell>

        {/* Col 2+3 – InsightCard + StreakWidget (md:col-span-2) */}
        <div className="sm:col-span-2 space-y-3">
          <CardShell>
            <Skeleton className="h-3 w-16 rounded-full mb-3" />
            <Skeleton className="h-5 w-full rounded-md mb-1.5" />
            <Skeleton className="h-5 w-4/5 rounded-md mb-4" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </CardShell>
          <CardShell className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-3 w-36 rounded-md" />
            </div>
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-6 rounded-md" />
              ))}
            </div>
          </CardShell>
        </div>

        {/* Col 4 – Priority action card */}
        <CardShell className="flex flex-col justify-between gap-4 bg-linear-to-br from-indigo-950/60 to-slate-900/60">
          <div className="space-y-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-2/3 rounded-md" />
          </div>
          <Skeleton className="h-9 w-full rounded-lg" />
        </CardShell>
      </div>

      {/* ── 2/3 + 1/3 layout (matches DashboardLayout children + recentActivity) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left 2/3 – Charts + Weak Topics */}
        <div className="lg:col-span-2 space-y-8">

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy Trend Chart */}
            <CardShell>
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-36 rounded-md" />
                  <Skeleton className="h-3 w-28 rounded-md" />
                </div>
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
              <Skeleton className="h-50 w-full rounded-xl" />
            </CardShell>

            {/* Focus Decay Chart */}
            <CardShell>
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
<Skeleton className="h-50 w-full rounded-xl" />
            </CardShell>
          </div>

          {/* Weak Topics / Focus Areas */}
          <CardShell className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
              <div className="space-y-1">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-3 w-52 rounded-md" />
              </div>
              <Skeleton className="h-4 w-14 rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl border border-border p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                  <Skeleton className="h-3 w-40 rounded-md" />
                </div>
              ))}
            </div>
          </CardShell>
        </div>

        {/* Right 1/3 – Recent Activity */}
        <CardShell className="p-0 overflow-hidden h-fit">
          <div className="px-5 pt-5 pb-4 border-b border-border">
            <Skeleton className="h-5 w-32 rounded-md" />
          </div>
          <div className="divide-y divide-border">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28 rounded-md" />
                    <Skeleton className="h-2.5 w-20 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-4 w-10 rounded-md" />
              </div>
            ))}
          </div>
          {/* Topic Radar placeholder */}
          <div className="px-5 pb-5 pt-4 border-t border-border space-y-3">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-55 w-full rounded-xl" />
          </div>
        </CardShell>

      </div>
    </div>
    </div>
    </div>
  );
}
