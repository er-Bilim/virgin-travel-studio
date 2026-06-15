import { useMemo, useState } from 'react';
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

  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredTags = useMemo(() => {
    return tags.filter((tag) =>
        (tag[labelKey] || '').toLowerCase().includes(search.toLowerCase()),
    );
  }, [tags, labelKey, search]);

  const visibleTags = showAll ? filteredTags : filteredTags.slice(0, 10);
  const hasMoreTags = filteredTags.length > 10;

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
      <nav
          aria-label="Фильтр по темам"
          className={cn('w-full min-w-0', className)}
      >
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start">
          {title && (
              <p className="shrink-0 pt-2 text-sm font-semibold uppercase text-gray-400">
                {title}
              </p>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowAll(false);
                }}
                placeholder="Поиск..."
                aria-label="Поиск по тегам"
                className="w-full max-w-[260px] rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />

            <ul
                role="list"
                aria-label={title ? `Список: ${title}` : 'Список фильтров'}
                className="flex min-w-0 flex-wrap gap-2 capitalize"
            >
              <li className="shrink-0">
                <Link
                    href={href}
                    aria-current={!activeTag ? 'true' : undefined}
                    className={cn(
                        chipStyles,
                        !activeTag ? activeChip : inactiveChip,
                    )}
                    onClick={() => {
                      getTag(null);
                      getId(null);
                    }}
                >
                  {mainTag}
                </Link>
              </li>

              {visibleTags.map((tag) => {
                const isActive = tag[labelKey] === activeTag;

                return (
                    <li key={tag[labelKey]} className="shrink-0">
                      <Link
                          href={`${href}?${searchParamsName}=${encodeURIComponent(
                              tag[labelKey],
                          )}`}
                          aria-current={isActive ? 'true' : undefined}
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
              {hasMoreTags && (
                  <li className="shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowAll((prev) => !prev)}
                        className="inline-flex items-center rounded-full border border-primary px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      {showAll ? 'Свернуть' : 'Показать ещё'}
                    </button>
                  </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
  );
};

export default Filter;
