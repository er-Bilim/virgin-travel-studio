import { Skeleton } from '@/components/ui/skeleton';

const NewsSkeleton = () => {
  return (
  <div className="animate-pulse">
    <div className="h-3 w-40 bg-muted rounded mb-3" />
    <div className="h-8 w-80 bg-muted rounded mb-2" />
    <div className="h-4 w-[420px] bg-muted rounded mb-6" />

    <div className="flex gap-2 mb-8">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-8 w-20 bg-muted rounded-full" />
      ))}
    </div>

    <div className="grid grid-cols-[1.6fr_1fr] gap-6 border-t pt-6 mb-10">
      <Skeleton className="aspect-[4/3] rounded-xl" />
      <div className="flex flex-col gap-3 pt-1">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-14 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2 mt-auto">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-[4/3] rounded-xl" />
          <div className="flex gap-1.5 mt-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex gap-2 mt-2 pt-3 border-t">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

export default NewsSkeleton;