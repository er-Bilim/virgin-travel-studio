import { Skeleton } from '@/components/ui/skeleton';

const SectionHeaderSkeleton = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-md" />
        <Skeleton className="h-3.5 w-40" />
      </div>
      <Skeleton className="h-9 w-[420px] max-w-full md:h-11" />
      <Skeleton className="h-4 w-[560px] max-w-full" />
    </div>
  );
};

export default SectionHeaderSkeleton;
