import { Skeleton } from '@/components/ui/skeleton';

const NewsSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mt-5" />

      <header className="mt-8 mb-8">
        <Skeleton className="h-4 w-36 rounded-sm mb-2" />
        <Skeleton className="h-10 w-3/4 max-w-lg rounded-md mt-2 md:h-12" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-md mt-3" />
      </header>

      <div className="mt-6">
        <Skeleton className="pl-0.5 w-[40px] h-[14px] rounded-xl mb-2" />
        <Skeleton className="w-[210px] h-[50px] rounded-xl shrink-0" />
      </div>

      <article className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-x-8 gap-y-3 items-stretch">
          <Skeleton className="relative aspect-[16/10] md:aspect-[4/3] w-full rounded-xl md:rounded-2xl" />

          <div className="flex flex-col justify-center py-1">
            <div className="flex gap-1.5 mb-3">
              <Skeleton className="h-4 w-12 rounded-md" />
              <Skeleton className="h-4 w-14 rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 md:h-8 w-full rounded-md" />
              <Skeleton className="h-5 md:h-8 w-2/3 rounded-md md:w-5/6" />
            </div>

            <div className="space-y-2 mt-2 md:mt-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 md:block hidden" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <div className="mt-5 md:mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5 md:gap-3">
              <div className="hidden md:block shrink-0">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="flex flex-row items-center gap-2.5 md:flex-col md:items-start md:gap-1 w-full">
                <Skeleton className="h-4 w-24 rounded-sm" />
                <div className="h-1 w-1 bg-slate-200 dark:bg-slate-800 rounded-full md:hidden" />
                <Skeleton className="h-3 w-12 rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </article>

      <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 mt-12 md:mt-10 md:border-t md:border-slate-100 md:dark:border-slate-800 md:pt-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col justify-between h-full">
            <div className="w-full">
              <Skeleton className="relative aspect-[16/10] md:aspect-[4/3] w-full rounded-xl mb-4" />

              <div className="flex gap-1.5 mb-3">
                <Skeleton className="h-4 w-10 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>

              <div className="space-y-2 mb-2">
                <Skeleton className="h-5 w-full rounded-md" />
                <Skeleton className="h-5 w-2/3 rounded-md" />
              </div>

              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Skeleton className="h-4 w-16 rounded-sm" />
              <div className="h-1 w-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <Skeleton className="h-3 w-12 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsSkeleton;
