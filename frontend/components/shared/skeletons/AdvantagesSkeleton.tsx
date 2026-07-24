import { Skeleton } from '@/components/ui/skeleton';

const AdvantagesSkeleton = () => {
  return (
    <article className="group rounded-2xl border border-border bg-white p-6 shadow-soft transition">
      <Skeleton className="mb-5 size-14 overflow-hidden rounded-2xl" />
      <Skeleton className="h-4 w-[60%]" />
      <Skeleton className="mt-2 h-15 w-[90%]" />
    </article>
  );
};

export default AdvantagesSkeleton;
