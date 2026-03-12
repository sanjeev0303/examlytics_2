import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingLoading() {
  return (
    <div className="min-h-full w-full relative flex flex-col items-center justify-center px-4 py-12">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950/80 mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]">
        <svg
          className="absolute inset-0 h-full w-full stroke-zinc-400/30 dark:stroke-zinc-600/20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="onboarding-grid-loading" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="translate(0,0)">
              <path d="M0 40V.5H40" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#onboarding-grid-loading)" />
        </svg>
      </div>
      <div className="absolute top-1/4 right-1/4 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 h-96 w-96 translate-y-1/2 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/10" />

      <div className="w-full max-w-3xl relative z-10">
        <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 animate-pulse">
      <Skeleton className="h-10 w-56 rounded-xl" />
      <Skeleton className="h-4 w-80 rounded-lg" />

      <div className="space-y-6 mt-8">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>

      <Skeleton className="h-12 w-full rounded-xl mt-6" />
    </div>
    </div>
    </div>
  );
}
