import { Skeleton } from '@/components/ui/skeleton';

const TourCardSkeleton = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="relative h-48">
        <Skeleton className="absolute inset-0 rounded-none" />
        <Skeleton className="absolute left-3 top-3 h-7 w-32 rounded-full" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="min-h-[3.25rem] space-y-2">
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[55%]" />
        </div>

        <div className="mt-1 flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="mt-3 flex items-center gap-4 pb-10">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-10" />
        </div>
        <div className="mt-auto flex items-end justify-between border-t border-border pt-4">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-6" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourCardSkeleton;
