import { Skeleton } from '@/components/ui/skeleton';

const NewsDetailSkeleton = () => {
  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
        <Skeleton className="h-3.5 w-64 max-w-[50%]" />
      </div>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-40 rounded-full" />
          </div>

          <div className="mt-4 space-y-3">
            <Skeleton className="h-9 w-[85%]" />
            <Skeleton className="h-9 w-[45%]" />
          </div>

          <div className="mt-6 flex items-center gap-3 border-b border-border pb-6">
            <Skeleton className="size-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>

          <Skeleton className="mt-8 aspect-video w-full rounded-[20px]" />

          <div className="mt-10 space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-[92%]" />
            <Skeleton className="h-5 w-[80%]" />
          </div>

          <div className="mt-8 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[70%]" />
          </div>

          <div className="mt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="mt-1.5 size-1.5 shrink-0 rounded-full" />
                <div className="w-full space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[55%]" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[65%]" />
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-4 w-44" />
              <div className="grid grid-cols-1 gap-2 sm:flex">
                <Skeleton className="h-11 w-32 rounded-xl" />
                <Skeleton className="h-11 w-32 rounded-xl" />
                <Skeleton className="h-11 w-32 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="space-y-6">
            <Skeleton className="h-52 w-full rounded-2xl" />

            <div className="rounded-2xl border border-border p-5">
              <Skeleton className="mb-4 h-3.5 w-32" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="size-16 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2 py-1">
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3.5 w-[60%]" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
              <Skeleton className="mt-5 h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailSkeleton;
