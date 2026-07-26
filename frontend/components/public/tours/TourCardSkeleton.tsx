import { Skeleton } from '@/components/ui/skeleton';

const TourCardSkeleton = () => {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card animate-pulse">
      <div className="relative">
        <Skeleton className="aspect-[4/3] rounded-none" />
        <Skeleton className="absolute top-3 left-3 h-6 w-24 rounded-full bg-white/70" />
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="space-y-2">
          <Skeleton className="h-[18px] w-3/4 rounded" />
          <Skeleton className="h-3.5 w-1/2 rounded" />
        </div>

        <div className="flex gap-3.5">
          <Skeleton className="h-3 w-14 rounded" />
          <Skeleton className="h-3 w-10 rounded" />
        </div>

        <div className="flex justify-between items-end border-t border-muted pt-3 gap-2">
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-6 rounded" />
            <Skeleton className="h-5 w-24 rounded" />
          </div>
          <div className="space-y-1.5 text-right">
            <Skeleton className="h-2.5 w-16 rounded ml-auto" />
            <Skeleton className="h-3 w-14 rounded ml-auto" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default TourCardSkeleton;