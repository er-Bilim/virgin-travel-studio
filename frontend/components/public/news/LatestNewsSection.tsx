'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { useNews } from '@/lib/hooks/newsHooks';
import { imageUrl } from '@/lib/constants';
import { formatDayAndMonthWords, truncateText } from '@/lib/utils';

const LatestNewsSection = () => {
  const { data, isLoading, isError } = useNews({
    page: 1,
    limit: 5,
    isPublished: 'true',
  });

  const news = data?.allNews || [];

  if (isLoading) {
    return (
      <section className="my-24">
        <p className="text-center text-muted-foreground">
          Загрузка новостей...
        </p>
      </section>
    );
  }

  const hasNews = news.length > 0 && !isError;
  const featured = hasNews ? news[0] : null;

  let featuredDay, featuredMonth, featuredYear;
  if (featured) {
    const formatted = formatDayAndMonthWords(featured.updatedAt);
    featuredDay = formatted.day;
    featuredMonth = formatted.month;
    featuredYear = formatted.year;
  }

  return (
    <section className="my-24">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-800">
            Журнал путешествий
          </p>
          <h2 className="text-3xl font-black text-navy-700 md:text-4xl">
            Последние новости
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Свежие обновления, полезные заметки и вдохновение для будущих
            путешествий.
          </p>
        </div>

        <Link
          href="/news"
          className="group inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold text-navy-700 transition hover:border-cyan-600 hover:text-cyan-600"
        >
          Все новости
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {!hasNews ? (
        <div className="flex h-48 w-full flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/30 text-center">
          <p className="text-lg font-medium text-navy-700">Пока нет новостей</p>
          <p className="text-sm text-muted-foreground mt-1">Новые статьи появятся здесь в ближайшее время.</p>
        </div>
      ) : (
        <div
          className={`grid items-stretch gap-5 relative ${
            news.length > 1 ? 'lg:grid-cols-[1.5fr_1fr]' : 'lg:grid-cols-1'
          }`}
        >
          {featured && (
            <div className="relative flex h-full">
              <div className="text-[var(--primary)] z-10 absolute top-5 left-5 uppercase text-sm bg-gray-100 rounded-xl py-1 px-4 font-semibold shadow-sm">
                главное
              </div>
              <Link
                href={`/news/${featured._id}`}
                className="group flex w-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-cyan-500"
              >
                <div className="aspect-[16/10] overflow-hidden lg:aspect-auto lg:h-[400px]">
                  {featured.image ? (
                    <img
                      src={imageUrl + featured.image}
                      alt={featured.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                      Нет изображения
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
                    <CalendarDays className="size-4" />
                    <p className="inline-flex items-center gap-1">
                      <span>
                        {featuredDay} {featuredMonth} {featuredYear}
                      </span>
                    </p>
                  </div>

                  <h3 className="text-xl font-bold leading-snug text-navy-700">
                    {featured.title}
                  </h3>
                  <p className="mt-2.5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {truncateText(featured.content, 255)}
                  </p>
                  {featured.tags.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                      {featured.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium capitalize text-cyan-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )}

          {news.length > 1 && (
            <div className="flex h-full flex-col gap-5">
              {news.slice(1).map((singleNews) => {
                const { day, month, year } = formatDayAndMonthWords(
                  singleNews.updatedAt,
                );

                return (
                  <Link
                    key={singleNews._id}
                    href={`/news/${singleNews._id}`}
                    className="group flex flex-1 overflow-hidden rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-cyan-500"
                  >
                    <div className="w-30 shrink-0 overflow-hidden sm:w-50">
                      {singleNews.image ? (
                        <img
                          src={imageUrl + singleNews.image}
                          alt={singleNews.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                          Нет фото
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        <p className="inline-flex items-center gap-1">
                          <span>
                            {day} {month} {year}
                          </span>
                        </p>
                      </div>
                      <h3 className="line-clamp-2 font-bold leading-snug text-navy-700">
                        {singleNews.title}
                      </h3>
                      {singleNews.tags.length > 0 && (
                        <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                          {singleNews.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium capitalize text-cyan-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default LatestNewsSection;