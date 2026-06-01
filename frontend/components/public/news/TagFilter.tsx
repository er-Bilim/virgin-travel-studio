import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Props {
  tags: string[];
  className?: string;
  setTag: (tag: string | null) => void;
}

const chipStyles =
  'inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors py-2';

const activeChip = 'bg-primary text-primary-foreground';

const inactiveChip =
  'bg-muted text-foreground border border-border hover:bg-accent';

const TagFilter = ({ tags, className, setTag }: Props) => {
  const searchParams = useSearchParams();
  const activeTag = searchParams.get('tags');

  const getTag = (tag: string | null) => {
    setTag(tag);
  };

  return (
    <nav aria-label="Фильтр по темам" className={cn(className)}>
      <div className="flex flex-row gap-5 items-center ">
        <p className="text-sm text-gray-400 uppercase font-semibold">темы:</p>
        <ul
          role="list"
          className="flex gap-2 overflow-x-auto pb-4 capitalize"
        >
          <li>
            <Link
              href="/news"
              aria-current={!activeTag && 'true'}
              className={cn(chipStyles, !activeTag ? activeChip : inactiveChip)}
              onClick={() => getTag(null)}
            >
              все новости
            </Link>
          </li>

          {tags.map((tag) => {
            const isActive = tag === activeTag;

            return (
              <li key={tag} className="shrink-0">
                <Link
                  href={`news?tags=${encodeURIComponent(tag)}`}
                  aria-current={isActive && 'true'}
                  onClick={() => getTag(tag)}
                  className={cn(
                    chipStyles,
                    isActive ? activeChip : inactiveChip,
                  )}
                >
                  {tag}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default TagFilter;
