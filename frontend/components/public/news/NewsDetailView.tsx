'use client';

import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import ClientAvatar from '@/components/shared/ClientAvatar';
import { useGetSingleNews } from '@/lib/hooks/newsHooks';
import {
  cn,
  formatDayAndMonthWords,
  formatToReadablePrice,
} from '@/lib/utils';
import { ArrowRight, Clock, Dot } from 'lucide-react';
import Image from 'next/image';
import { imageUrl, isDev } from '@/lib/constants';
import ShareButton from '../buttons/share/ShareButton';
import { usePathname } from 'next/navigation';
import ErrorState from '@/components/shared/ErrorState';
import Link from 'next/link';
import { usePopularTours } from '@/lib/hooks/tourHooks';
import CONTENT_PLACEHOLDER from '@/assets/placeholders/content_placeholder.png';
import NewsDetailSkeleton from '@/components/shared/skeletons/NewsDetailSkeleton';

interface Props {
  id: string;
  tourLimit: number;
}

type Block = { type: 'p'; text: string } | { type: 'ul'; items: string[] };

const NewsDetailView = ({ id, tourLimit }: Props) => {
  const blocks: Block[] = [];
  const pathname = usePathname();
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`;
  const { data: news, isLoading, isError, refetch } = useGetSingleNews(id);
  const { data: tours } = usePopularTours(tourLimit);

  if (isLoading) {
    return <NewsDetailSkeleton />;
  }

  if (isError || !news) {
    return (
      <div className="py-16 sm:py-20">
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  const { day, month, year } = formatDayAndMonthWords(news.createdAt);

  const words: number = news.content.trim().split(/\s+/).length;

  const imageSrc: string = `${imageUrl}api/news/image/${news.image}`;

  const paragraphs: string[] = news.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  for (const line of paragraphs) {
    const isItem = /^[-–—]\s+/.test(line);

    if (isItem) {
      const text = line.replace(/^[-–—]\s+/, '');
      const last = blocks[blocks.length - 1];
      if (last?.type === 'ul') last.items.push(text);
      else blocks.push({ type: 'ul', items: [text] });
    } else {
      blocks.push({ type: 'p', text: line });
    }
  }

  return (
    <section className="px-5 md:px-8 py-10">
      <Breadcrumbs
        items={[{ label: 'Новости', href: '/news' }, { label: news.title }]}
      />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
        <article
          itemScope
          itemType="https://schema.org/NewsArticle"
          className="mt-5"
        >
          <header className="mx-auto max-w-[860px] border-b border-border pb-7">
            <ul
              aria-label="Теги статьи"
              role="list"
              className="flex flex-wrap gap-3 lowercase"
            >
              {news.tags.length > 0 &&
                news.tags.map((tag, index) => (
                  <li
                    key={tag + index}
                    className="text-sm text-[var(--ring)] bg-slate-100 rounded-xl px-4 py-1"
                  >
                    <p>{tag}</p>
                  </li>
                ))}
            </ul>

            <h1
              itemProp="headline"
              className="mt-4 text-3xl md:text-[42px] font-black leading-[1.12] tracking-tight text-navy-800"
            >
              {news.title}
            </h1>

            <div className="mt-5 text-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-row items-center gap-3">
                <ClientAvatar name={news.author.fullName} size="lg" />
                <div className="flex flex-col text-[var(--primary)]">
                  <p className="font-semibold">{news.author.fullName}</p>
                  <div className="flex flex-wrap items-center gap-2 text-gray-500">
                    <div>
                      <p className="flex gap-1 text-gray-500">
                        <span className="font-semibold">{day}</span>
                        <span>{month}</span>
                        <span className="font-semibold">{year}</span>
                      </p>
                    </div>
                    <Dot size={12} />
                    <div className="flex flex-row gap-1 items-center">
                      <Clock size={16} />
                      <p>{Math.ceil(words / 200)} мин чтения</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <ShareButton
                  platform="telegram"
                  url={url}
                  title="telegram"
                  className="size-10 bg-slate-50"
                />
                <ShareButton
                  platform="whatsapp"
                  url={url}
                  title="whatsapp"
                  className="size-10 bg-slate-50"
                />
                <ShareButton
                  platform="copy"
                  url={url}
                  title="copy"
                  className="cursor-pointer size-10 bg-slate-50"
                />
              </div>
            </div>
          </header>

          {news.image && (
            <figure className="relative mx-auto my-10 aspect-video w-full max-w-[860px]">
              <Image
                src={imageSrc}
                alt={news.title}
                fill
                priority
                unoptimized={isDev}
                itemProp="image"
                className="rounded-xl object-cover"
              />
            </figure>
          )}

          <div itemProp="articleBody" className="mx-auto max-w-[860px]">
            {blocks.map((block, i) => {
              if (block.type === 'ul') {
                return (
                  <ul key={i} className="mb-6 space-y-3.5">
                    {block.items.map((item, j) => (
                      <li
                        key={j}
                        className="relative pl-6 text-[1.0625rem] leading-[1.7] text-[var(--primary)]"
                      >
                        <span className="absolute left-0 top-[0.65em] size-1.5 rounded-full bg-cyan-800" />
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }

              const isLead = i === 0;
              return (
                <p
                  key={i}
                  className={cn(
                    'text-[var(--primary)]',
                    isLead
                      ? 'text-xl font-medium leading-[1.75] mb-6'
                      : 'text-[1.0625rem] leading-[1.85] mb-6',
                  )}
                >
                  {block.text}
                </p>
              );
            })}
          </div>
          <div className="mx-auto max-w-[860px] mt-14 border-t border-border pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
            <p className="text-sm text-gray-500">Понравилось? Поделитесь:</p>
            <div className="grid grid-cols-1 gap-2 sm:flex">
              <ShareButton
                platform="telegram"
                url={url}
                title="telegram"
                variant="labeled"
                className="flex-1 p-5 bg-slate-50"
              />
              <ShareButton
                platform="whatsapp"
                url={url}
                title="whatsapp"
                variant="labeled"
                className="flex-1 p-5 bg-slate-50"
              />
              <ShareButton
                platform="copy"
                url={url}
                title="copy"
                variant="labeled"
                className="flex-1 p-5 bg-slate-50 cursor-pointer"
              />
            </div>
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <div className="overflow-hidden rounded-2xl bg-navy-800 p-6 text-white">
              <div className="text-[11px] font-bold uppercase tracking-[.16em] text-cyan-300">
                <p>Virgin Travel Studio</p>
              </div>
              <h3 className="mt-2 text-lg font-extrabold leading-snug">
                Соберите тур мечты под себя
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Маршрут, отель, даты – а остальное мы возьмём на себя
              </p>
              <Link
                href="/tours/custom"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800/90"
              >
                <ArrowRight />
                Собрать тур
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-400 p-5">
              <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[.12em] text-navy-700/60">
                Популярные туры
              </h3>

              <div className="space-y-4">
                {tours &&
                  tours.map((tour) => {
                    const tourImage = tour.images[0]
                      ? `${imageUrl}api/tours/image/${tour.images[0]}`
                      : CONTENT_PLACEHOLDER;
                    const { price, currency } = formatToReadablePrice(
                      tour.minPrice,
                    );
                    return (
                      <Link
                        key={tour._id}
                        href={`/tours/${tour._id}`}
                        className="group flex gap-5"
                      >
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                          <Image
                            src={tourImage}
                            alt={tour.title}
                            fill
                            unoptimized={isDev}
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-2 text-sm font-semibold leading-snug text-navy-800 transition group-hover:text-cyan-800">
                            {tour.title}
                          </div>
                          <p className="mt-1 text-sm font-black text-navy-800">
                            {price}
                            <span className="text-xs font-bold text-navy-700/45">
                              {currency}
                            </span>
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                <div>
                  <Link
                    href="/tours"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-800 duration-600 transition hover:gap-2.5 "
                  >
                    Все туры
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default NewsDetailView;