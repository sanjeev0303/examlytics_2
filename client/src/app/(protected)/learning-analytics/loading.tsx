import { Skeleton } from "@/components/ui/skeleton";

function CardShell({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`rounded-3xl border border-white/5 bg-zinc-900/40 p-5 ${className}`}>
      {children}
    </div>
  );
}

export default function LearningAnalyticsLoading() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden p-4 md:p-8 lg:p-12 relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] aspect-square rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] aspect-square rounded-full bg-rose-600/10 blur-[120px]" />
      </div>

      <div className="max-w-400 mx-auto p-4 md:p-8 relative z-10 space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="h-9 w-64 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-80 rounded-md ml-[52px]" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        {/* Analytics Overview — hero + metrics skeleton */}
        <CardShell className="h-96 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-3 w-64 rounded-md" />
          </div>
        </CardShell>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <CardShell key={i} className="h-44 flex flex-col justify-between">
              <div className="flex justify-between">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-7 w-20 rounded-md" />
              </div>
              <Skeleton className="h-3 w-full rounded-md" />
            </CardShell>
          ))}
        </div>

        {/* Performance section skeleton */}
        <div className="pt-4 space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="w-1.5 h-6 rounded-full" />
            <Skeleton className="h-6 w-48 rounded-md" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardShell className="h-80" />
            <CardShell className="h-80" />
          </div>
        </div>

        {/* Behavior section skeleton */}
        <div className="pt-4 space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="w-1.5 h-6 rounded-full" />
            <Skeleton className="h-6 w-40 rounded-md" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardShell className="h-80" />
            <CardShell className="h-60" />
          </div>
        </div>
      </div>
    </div>
  );
}
