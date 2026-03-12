export function SectionSkeleton({ minHeight = "60vh" }: { minHeight?: string }) {
  return (
    <div
      style={{ minHeight }}
      className="w-full flex flex-col items-center justify-center gap-6 px-6 py-20"
    >
      <div className="h-10 w-64 rounded-xl bg-white/5 animate-pulse" />
      <div className="h-4 w-96 max-w-full rounded-lg bg-white/4 animate-pulse" />
      <div className="h-4 w-72 max-w-full rounded-lg bg-white/4 animate-pulse" />
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-40 w-64 rounded-2xl bg-white/5 animate-pulse"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
