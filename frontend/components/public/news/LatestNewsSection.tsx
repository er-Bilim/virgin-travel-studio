'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { useNews } from '@/lib/hooks/newsHooks';
import { imageUrl } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

interface LatestNewsSectionProps {
  title?: string;
  subtitle?: string;
}

const LatestNewsSection = ({ title, subtitle }: LatestNewsSectionProps) => {
  const { data, isLoading, isError } = useNews({
    page: 1,
    limit: 5,
    isPublished: 'true',
  });

  const news = data?.allNews || [];
  const [featured, side, ...rest] = news;

  if (isLoading) {
    return (
      <section className="my-24">
        <p className="text-center text-muted-foreground">
          Загрузка новостей...
        </p>
      </section>
    );
  }

  if (isError || news.length === 0) {
    return null;
  }

  return (
    <section className="my-24 px-4 max-w-7xl mx-auto w-full">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-800">
            Журнал путешествий
          </p>

          <h2 className="text-3xl font-black text-[#1E2B6D] md:text-4xl">
            {title || 'Последние новости'}
          </h2>

          <p className="mt-3 max-w-xl text-muted-foreground whitespace-pre-line">
            {subtitle || 'Свежие обновления, полезные заметки и вдохновение для будущих путешествий.'}
          </p>
        </div>

        <Link
          href="/news"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-navy-700 transition hover:-translate-y-0.5 hover:border-cyan-800 shrink-0 self-start md:self-end"
        >
          Все новости
          <ArrowRight className="h-4 w-4"/>
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-6">
        <div className="lg:col-span-4">
          <Link
            href={`/news/${featured._id}`}
            className="group flex flex-col h-full overflow-hidden rounded-3xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 shadow-cyan-200 hover:shadow-[0_1px_10px_rgba(0,0,0,0.1)]"
          >
            <div className="min-h-64 md:min-h-80 flex-1">
              {featured.image ? (
                <img
                  src={imageUrl + featured.image}
                  alt={featured.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                  Нет изображения
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-4 w-4"/>
                {formatDate(featured.createdAt)}
              </div>

              <h3 className="line-clamp-2 text-lg font-bold text-navy-700">
                {featured.title}
              </h3>

              <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {featured.content}
              </p>

              {featured.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {featured.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize text-cyan-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Боковая новость */}
        <div className="lg:col-span-2 flex">
          <Link
            href={`/news/${side._id}`}
            className="group flex flex-col w-full overflow-hidden rounded-3xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 shadow-cyan-200 hover:shadow-[0_1px_10px_rgba(0,0,0,0.1)]"
          >
            <div className="min-h-64 flex-1">
              {side.image ? (
                <img
                  src={imageUrl + side.image}
                  alt={side.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                  Нет изображения
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-4 w-4"/>
                {formatDate(side.createdAt)}
              </div>

              <h3 className="line-clamp-2 text-lg font-bold text-navy-700">
                {side.title}
              </h3>

              <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {side.content}
              </p>

              {side.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {side.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize text-cyan-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        </div>

        {rest.length > 0 && (
          <div className="lg:col-span-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((item) => (
              <Link
                key={item._id}
                href={`/news/${item._id}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 shadow-cyan-200 hover:shadow-[0_1px_10px_rgba(0,0,0,0.1)]"
              >
                <div className="min-h-32 flex-1">
                  {item.image ? (
                    <img
                      src={imageUrl + item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                      Нет изображения
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3"/>
                    {formatDate(item.createdAt)}
                  </div>
                  <h3 className="line-clamp-2 text-sm font-bold text-navy-700">{item.title}</h3>
                  {item.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold capitalize text-cyan-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestNewsSection;