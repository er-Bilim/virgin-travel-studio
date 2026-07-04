import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  limit?: number;
}

const LatestNewsSkeleton = ({ limit = 4 }: Props) => {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white">
        <Skeleton className="h-56 rounded-none sm:h-72" />
        <div className="flex flex-1 flex-col p-6">
          <Skeleton className="h-3 w-28" />
          <div className="mt-4 space-y-2.5">
            <Skeleton className="h-6 w-[85%]" />
            <Skeleton className="h-6 w-[55%]" />
          </div>
          <div className="mt-5 space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-[70%]" />
          </div>
          <div className="mt-6 flex gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>
      </article>

      <div className="flex flex-col gap-4">
        {Array.from({ length: limit }).map((_, i) => (
          <article
            key={i}
            className="flex gap-4 rounded-2xl border border-slate-300 bg-white p-3"
          >
            <Skeleton className="h-28 w-36 shrink-0 rounded-xl sm:w-44" />
            <div className="flex flex-1 flex-col justify-center gap-3 py-1 pr-2">
              <Skeleton className="h-3 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-[90%]" />
                <Skeleton className="h-5 w-[50%]" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default LatestNewsSkeleton;
