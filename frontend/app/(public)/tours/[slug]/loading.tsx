import { Skeleton } from '@/components/ui/skeleton';

const TourDetailLoading = () => {
  return (
    <>
      <section className="mt-10">
        <nav className="mb-10 flex items-center gap-2" aria-hidden>
          <Skeleton className="h-4 w-12 rounded" />
          <span className="text-gray-300">›</span>
          <Skeleton className="h-4 w-24 rounded" />
          <span className="text-gray-300">›</span>
          <Skeleton className="h-4 w-40 rounded" />
        </nav>

        <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
        <div className="mt-7">
          <Skeleton className="h-9 w-2/3 rounded-lg" />
          <div className="mt-3 flex gap-6">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-5 w-28 rounded" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-[1fr_420px] gap-6">
        <div className="flex flex-col gap-6">
          <div className="mt-6">
            <Skeleton className="h-7 w-32 rounded" />
            <Skeleton className="mt-3 h-4 w-full rounded" />
            <Skeleton className="mt-2 h-4 w-4/5 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>

          <div>
            <Skeleton className="h-7 w-48 rounded" />
            <div className="mt-5 flex flex-wrap gap-2.5">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-44 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-10">
            <Skeleton className="h-7 w-40 rounded" />
            <div className="mt-5 flex flex-col gap-5">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        <aside>
          <Skeleton className="h-[420px] rounded-2xl" />
        </aside>
      </div>
    </>
  );
};

export default TourDetailLoading;
