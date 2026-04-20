export default function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white/[0.02] border border-border rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="h-[18px] w-32 rounded bg-white/[0.04] animate-pulse" />
        <div className="h-7 w-12 rounded-full bg-white/[0.04] animate-pulse" />
      </div>
      <div className="h-3 w-24 rounded bg-white/[0.04] animate-pulse" />
      <div className="space-y-1.5 mb-1">
        <div className="h-3 w-full rounded bg-white/[0.04] animate-pulse" />
        <div className="h-3 w-full rounded bg-white/[0.04] animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-white/[0.04] animate-pulse" />
      </div>
      <div className="mt-auto flex gap-2">
        <div className="h-8 flex-1 rounded-full bg-white/[0.04] animate-pulse" />
        <div className="h-8 flex-1 rounded-full bg-white/[0.04] animate-pulse" />
      </div>
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 rounded-full bg-white/[0.04] animate-pulse"
            />
          ))}
        </div>
        <div className="h-8 w-44 rounded-full bg-white/[0.04] animate-pulse" />
      </div>
      <SkeletonGrid />
    </>
  );
}

export function StatsSkeleton() {
  return (
    <div className="h-[18px] w-64 rounded bg-white/[0.04] animate-pulse" />
  );
}
