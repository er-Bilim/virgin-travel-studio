import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type FilterItem<K extends string> = {_id?: string} & Record<K, string>;

interface Props<K extends string> {
  tags: FilterItem<K>[];
  labelKey: K
  className?: string;
  setTag: (tag: string | null) => void;
  href: string;
  mainTag: string;
  title?: string;
}

const chipStyles =
  'inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors py-2';

const activeChip = 'bg-primary text-primary-foreground';

const inactiveChip =
  'bg-muted text-foreground border border-border hover:bg-accent';

const Filter = <K extends string>({ tags, className, setTag, href, mainTag, title, labelKey}: Props<K>) => {
  const searchParams = useSearchParams();
  const activeTag = searchParams.get('tags');

  const getTag = (tag: string | null) => {
    setTag(tag);
  };

  return (
    <nav aria-label="Фильтр по темам" className={cn(className)}>
      <div className="flex flex-row gap-5 items-center ">
        {title && <p className="text-sm text-gray-400 uppercase font-semibold">{title}</p>}
        <ul
          role="list"
          aria-label={labelKey}
          className="flex gap-2 overflow-x-auto pb-4 capitalize"
        >
          <li>
            <Link
              href={href}
              aria-current={!activeTag && 'true'}
              className={cn(chipStyles, !activeTag ? activeChip : inactiveChip)}
              onClick={() => getTag(null)}
            >
              {mainTag}
            </Link>
          </li>

          {tags.map((tag) => {
            const isActive = tag[labelKey] === activeTag;

            return (
              <li key={tag[labelKey]} className="shrink-0">
                <Link
                  href={`news?tags=${encodeURIComponent(tag[labelKey])}`}
                  aria-current={isActive && 'true'}
                  onClick={() => getTag(tag[labelKey])}
                  className={cn(
                    chipStyles,
                    isActive ? activeChip : inactiveChip,
                  )}
                >
                  {tag[labelKey]}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Filter;
