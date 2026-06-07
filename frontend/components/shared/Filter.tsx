import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type FilterItem<K extends string> = {_id?: string} & Record<K, string>;

interface Props<K extends string> {
  tags: FilterItem<K>[];
  labelKey: K
  className?: string;
  setTag?: (tag: string | null) => void;
  setId?: (id?: string | null) => void;
  href: string;
  mainTag: string;
  title?: string;
  searchParamsName: string;
}

const chipStyles =
  'inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors py-2';

const activeChip = 'bg-primary text-primary-foreground';

const inactiveChip =
  'bg-muted text-foreground border border-border hover:bg-accent';

const Filter = <K extends string>({ tags, className, setTag, setId, href, mainTag, title, labelKey, searchParamsName}: Props<K>) => {
  const searchParams = useSearchParams();
  const activeTag = searchParams.get(searchParamsName);

  const getTag = (tag: string | null) => {
    if (setTag) {
      setTag(tag)
    }
  };

  const getId = (id?: string | null) => {
    if (setId) {
      setId(id);
    }
  }

  return (
      <nav aria-label="Фильтр по темам" className={cn('w-full min-w-0', className)}>
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start">
          {title && (
              <p className="shrink-0 pt-2 text-sm text-gray-400 uppercase font-semibold">
                {title}
              </p>
          )}

          <ul
              role="list"
              aria-label={labelKey}
              className="flex min-w-0 flex-wrap gap-2 capitalize"
          >
            <li className="shrink-0">
              <Link
                  href={href}
                  aria-current={!activeTag && 'true'}
                  className={cn(chipStyles, !activeTag ? activeChip : inactiveChip)}
                  onClick={() => {
                    getTag(null);
                    getId(null);
                  }}
              >
                {mainTag}
              </Link>
            </li>

            {tags.map((tag) => {
              const isActive = tag[labelKey] === activeTag;

              return (
                  <li key={tag[labelKey]} className="shrink-0">
                    <Link
                        href={`${href}?${searchParamsName}=${encodeURIComponent(
                            tag[labelKey],
                        )}`}
                        aria-current={isActive && 'true'}
                        onClick={() => {
                          getTag(tag[labelKey]);
                          getId(tag?._id);
                        }}
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
