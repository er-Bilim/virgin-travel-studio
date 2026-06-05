import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const CategoryFilterSkeleton = () => {
  const widths = ['w-[110px]', 'w-[130px]', 'w-[95px]', 'w-[140px]', 'w-[155px]'];

  return (
    <div className="flex items-center gap-2 flex-1 flex-wrap">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
        Категории
      </span>
      {widths.map((width, index) => (
        <Skeleton
          key={index}
          className={cn('h-[31px] rounded-full', width)}
          style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </div>
  );
}

export default CategoryFilterSkeleton