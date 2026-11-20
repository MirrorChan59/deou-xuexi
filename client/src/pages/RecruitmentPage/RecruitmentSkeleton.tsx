import { Skeleton } from '@client/src/components/ui/skeleton';

const SkeletonBlock = ({ className }: { className: string }) => (
  <Skeleton className={className} />
);

export const CardListSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="flex h-[320px] flex-col gap-4 rounded-2xl bg-card p-6 shadow-sm"
      >
        <div className="space-y-2">
          <SkeletonBlock className="h-6 w-2/3" />
          <SkeletonBlock className="h-4 w-1/2" />
        </div>
        <div className="flex flex-wrap gap-2">
          <SkeletonBlock className="h-6 w-16 rounded-full" />
          <SkeletonBlock className="h-6 w-16 rounded-full" />
          <SkeletonBlock className="h-6 w-14 rounded-full" />
        </div>
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="mt-auto h-10 w-full rounded-full" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
    <div className="flex gap-4 border-b border-border/60 bg-muted/40 px-4 py-3">
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonBlock key={i} className="h-4 w-20" />
      ))}
    </div>
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 border-b border-border/40 px-4 py-4 last:border-b-0"
      >
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-4 w-52" />
        <SkeletonBlock className="h-4 w-14" />
        <SkeletonBlock className="h-4 w-12" />
        <SkeletonBlock className="h-4 w-14" />
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);
