'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Dot, Newspaper, AlertCircle, AlignStartVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import ClientAvatar from '@/components/shared/ClientAvatar';
import { Dot, Newspaper } from 'lucide-react';
import { useState } from 'react';
import { PaginationCustom } from '@/components/pagination/PaginationCustom';
import { Skeleton } from '@/components/ui/skeleton';
import NewsSkeleton from './NewsSkeleton';
import { useGetNewsTags, useNews } from '@/lib/hooks/newsHooks';
import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';
import { imageUrl, isDev } from '@/lib/constants';
import { formatDayAndMonthWords, truncateText } from '@/lib/utils';
import CONTENT_PLACEHOLDER from '@/assets/placeholders/content_placeholder.png';
import { Skeleton } from '@/components/ui/skeleton';
import FilterCombobox from '@/components/shared/FilterCombobox';
import { useSearchParams } from 'next/navigation';

const NewsList = () => {
  const [page, setPage] = useState(1);
  const limit = 7;
  const searchParams = useSearchParams();
  const tag = searchParams.get('tags');

  const { data: settings } = useHomepageSettings();

  const {
    data: news,
    isPending: newsPending,
    isError: newsError,
  } = useNews({ page, limit, tags: tag });

  const {
    data: tags,
    isLoading: tagsLoading,
    isError: tagsError,
  } = useGetNewsTags();

  const tagsSettingsCombobox = {
    title: 'Все темы',
    icon: AlignStartVertical,
    queryParamsName: 'tags',
    searchPlaceholder: 'Поиск темы',
  };

  const selectedTag = tags ? tags.find((tagItem) => tagItem.tag === tag) : null;

  const metadata = news?.metadata;

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  if (newsPending) {
    return <NewsSkeleton />;
  }

  if (newsError || !news || tagsError || !tags) {
    return toast.error('Что-то пошло не так');
  }

  if (!news.allNews.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="bg-muted rounded-full p-5">
          <Newspaper className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-lg">Новостей пока нет</p>
          <p className="text-muted-foreground text-sm mt-1">
            Попробуйте выбрать другую тему или загляните позже
          </p>
        </div>
      </div>
    );
  }

  const { day: mainNewsDay, month: mainNewsMonth } = formatDayAndMonthWords(news.allNews[0].createdAt)

  const renderPagination = () => {
    if (metadata) {
      return (
        <div className="my-10 border-t pt-6">
          <PaginationCustom
            page={page}
            limit={metadata.limit}
            totalPage={metadata.totalPages}
            onChange={handlePageChange}
          />
        </div>
      );
    }
  };

  return (
    <>
      <Breadcrumbs
        className="mt-5"
        items={[
          {
            label: 'Главная',
            href: '/',
          },
          {
            label: 'Новости',
            href: '/news',
          },
        ]}
      />

      <header>
        <p className="text-[var(--cyan-800)] font-semibold uppercase">
          Журнал путешествий
        </p>

        <h1 className="font-black text-navy-800 text-4xl mt-3 md:text-5xl">
          {settings?.newsPage?.title || 'Новости и истории'}
        </h1>

        <p className="text-gray-500 my-2">
          Свежие маршруты, обновления виз, истории путешественников и подборки
          скрытых мест.
        </p>
      </header>

      {tagsLoading ? (
        <div className="flex flex-col mt-8 pb-2">
            <Skeleton className="pl-0.5 w-[40px] h-[14px] rounded-xl" />
            <Skeleton className="w-[210px] w-[50px] rounded-xl shrink-0" />
        </div>
      ) : (
        <div className="mt-6">
          <span className="pl-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Темы
          </span>
          <FilterCombobox
            options={tags}
            labelKey="tag"
            settings={tagsSettingsCombobox}
            queryParamsKey="tag"
            selected={selectedTag ? selectedTag.tag : null}
          />
        </div>
      )}

      <article className="group grid grid-cols-[20fr_1fr] gap-6 mt-10 border-t pt-10">
        <Link
          href={`news/${news.allNews[0]._id}`}
          className="group grid grid-cols-[1.6fr_1fr] gap-6"
        >
          <figure className="relative aspect-[4/3] overflow-hidden rounded-xl relative">
            <Image
              src={imageUrl + news.allNews[0].image || CONTENT_PLACEHOLDER}
              alt={news.allNews[0].title}
              fill
              priority
              unoptimized={isDev}
              itemProp="image"
              className="rounded-xl object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="text-[var(--primary)] z-3 absolute top-5 left-5 uppercase text-sm bg-gray-100 rounded-xl py-1 px-4 font-semibold ">
              главное
            </div>
          </figure>

          <div className="flex flex-col  gap-4">
            <div className="flex flex-wrap gap-2">
              {news.allNews[0].tags.map((tag, index) => (
                <span
                  key={tag + index}
                  className="text-xs capitalize bg-slate-100 px-3 py-1 rounded-xl font-semibold text-cyan-500"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="font-semibold text-4xl">{news.allNews[0].title}</h2>
            <p>{truncateText(news.allNews[0].content, 200)}</p>

            <div className="mt-auto flex flex-row gap-1 items-center mt-2">
              <div className="flex flex-row items-center gap-2">
                <ClientAvatar name={news.allNews[0].author.fullName} />
                <p className="font-semibold">
                  {news.allNews[0].author.fullName}
                </p>
              </div>
              <Dot size={10} className="text-gray-500" />
              <time
                dateTime="ISO"
                itemProp="datePublished"
                className="flex flex-row gap-1 text-sm text-gray-500"
              >
                <span className="font-semibold">
                  {mainNewsDay}
                </span>
                <span>{mainNewsMonth}</span>
              </time>
            </div>
          </div>
        </Link>
      </article>

      <ul
        role="list"
        className="grid grid-cols-1 gap-[40px] sm:grid-cols-2 lg:grid-cols-3 mt-10"
      >
        {news.allNews.map((singleNews, index) => {
          const { day, month } = formatDayAndMonthWords(singleNews.createdAt)
          if (index !== 0) {
            return (
              <li key={singleNews._id}>
                <article itemScope itemType="https://schema.org/Article">
                  <Link
                    href={`/news/${singleNews._id}`}
                    className="group flex flex-col"
                  >
                    <figure className="relative aspect-[4/3] overflow-hidden rounded-xl mb-3">
                      <Image
                        src={imageUrl + singleNews.image || CONTENT_PLACEHOLDER}
                        alt={singleNews.title}
                        fill
                        priority
                        unoptimized={isDev}
                        itemProp="image"
                        className="rounded-xl object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </figure>

                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {singleNews.tags.map((tag, index) => (
                        <span
                          key={tag + index}
                          className="text-xs capitalize bg-slate-100 px-3 py-1 rounded-xl font-semibold text-cyan-500 mt-3"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                  <h3
                    className="font-bold text-lg mt-1 text-gray-900 group-hover:text-[#1E2B6D] transition-colors line-clamp-2 leading-snug"
                    itemProp="headline"
                  >
                    {singleNews.title}
                  </h3>

                    <p className="line-clamp-2line-clamp-2 mt-2 pb-4">
                      {truncateText(singleNews.content, 150)}
                    </p>

                    <footer className="mt-auto pt-2 flex flex-row items-center gap-1 text-sm border-t pt-4 text-gray-500">
                      <span itemProp="author" className="font-semibold">
                        {singleNews.author.fullName}
                      </span>
                      <Dot size={10} />
                      <time
                        dateTime="ISO"
                        itemProp="datePublished"
                        className="flex flex-row gap-1"
                      >
                        <span>{day}</span>
                        <span>{month}</span>
                      </time>
                    </footer>
                  </Link>
                </article>
              </li>
            );
          }
        })}
      </ul>

      {renderPagination()}
    </>
  );
};

export default NewsList;
