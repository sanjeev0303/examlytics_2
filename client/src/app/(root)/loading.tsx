import { SectionSkeleton } from "@/components/ui/SectionSkeleton";

export default function HomeLoading() {
  return (
    <div className="bg-[#050511] min-h-screen text-white">
      {/* Navbar skeleton */}
      <div className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between animate-pulse">
        <div className="h-8 w-32 rounded-lg bg-white/5" />
        <div className="flex gap-4">
          <div className="h-8 w-20 rounded-lg bg-white/5" />
          <div className="h-8 w-20 rounded-lg bg-white/5" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 animate-pulse">
        <div className="h-14 w-lg max-w-full rounded-xl bg-white/5" />
        <div className="h-5 w-md max-w-full rounded-lg bg-white/4" />
        <div className="h-5 w-96 max-w-full rounded-lg bg-white/4" />
        <div className="flex gap-4 mt-6">
          <div className="h-12 w-40 rounded-xl bg-indigo-500/20" />
          <div className="h-12 w-36 rounded-xl bg-white/5" />
        </div>
      </div>

      <SectionSkeleton />
    </div>
  );
}
