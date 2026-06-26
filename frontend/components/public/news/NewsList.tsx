'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Dot, Newspaper, AlignStartVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import ClientAvatar from '@/components/shared/ClientAvatar';
import { useState } from 'react';
import { PaginationCustom } from '@/components/pagination/PaginationCustom';
import NewsSkeleton from './NewsSkeleton';
import { useGetNewsTags, useNews } from '@/lib/hooks/newsHooks';
import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';
import { imageUrl, isDev } from '@/lib/constants';
import { formatDayAndMonthWords } from '@/lib/utils';
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

  const { day: mainNewsDay, month: mainNewsMonth } = formatDayAndMonthWords(news.allNews[0].createdAt);

  const renderPagination = () => {
    if (metadata) {
      return (
        /* Синхронизировали отступы пагинации с турами (my-12) */
        <div className="my-12 border-t border-slate-100 dark:border-slate-800 pt-6">
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
    /* Завернули в базовый w-full pb-16 для соблюдения общей структуры отступов */
    <div className="w-full pb-16">
      <Breadcrumbs
        className="mt-5"
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Новости', href: '/news' },
        ]}
      />

      <header className="mt-8 mb-8">
        <p className="text-cyan-800 font-semibold uppercase text-sm tracking-wider">
          Журнал путешествий
        </p>
        {/* Привели стилистику шрифта к единому виду с турами (font-black text-navy-800 mt-3) */}
        <h1 className="font-black text-navy-800 dark:text-white text-4xl mt-3 md:text-5xl">
          {settings?.newsPage?.title || 'Новости и истории'}
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-3 max-w-2xl text-base leading-relaxed">
          Свежие маршруты, обновления виз, истории путешественников и подборки скрытых мест.
        </p>
      </header>

      {/*
        Унифицировали панель фильтрации: теперь темы не растягиваются на весь экран,
        а аккуратно занимают фиксированную ширину, завершаясь нижней линией-разделителем.
      */}
      <div className="mb-6 border-b border-gray-100 dark:border-slate-800 pb-6">
        {tagsLoading ? (
          <div className="flex flex-col gap-1 sm:w-64">
            <Skeleton className="pl-0.5 w-[40px] h-[14px] rounded-xl" />
            <Skeleton className="w-full h-[50px] rounded-xl" />
          </div>
        ) : (
          <div className="flex flex-col gap-1 sm:w-64">
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
      </div>

      {/* Т.к. верхняя панель фильтрации уже получила разделитель pb-6, здесь просто делаем отступ mt-8 */}
      <article className="mt-8">
        <Link
          href={`/news/${news.allNews[0]._id}`}
          className="group grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-x-8 gap-y-3 items-stretch"
        >
          <figure className="relative aspect-[16/10] md:aspect-[4/3] w-full overflow-hidden rounded-xl md:rounded-2xl bg-muted shadow-xs">
            <Image
              src={imageUrl + news.allNews[0].image || CONTENT_PLACEHOLDER}
              alt={news.allNews[0].title}
              fill
              priority
              unoptimized={isDev}
              itemProp="image"
              className="object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
            />
            <div className="text-[var(--primary)] z-3 absolute top-4 left-4 uppercase text-sm bg-gray-100 rounded-xl py-1 px-4 font-semibold ">
              главное
            </div>
          </figure>

          <div className="flex flex-col justify-center py-1">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {news.allNews[0].tags.map((tag, index) => (
                <span
                  key={tag + index}
                  className="text-[10px] md:text-[11px] uppercase tracking-wider bg-slate-100 dark:bg-slate-800/60 md:bg-cyan-50 md:dark:bg-cyan-950/40 px-2.5 py-0.5 md:py-1 rounded-md font-bold text-slate-600 dark:text-slate-400 md:text-cyan-600 md:dark:text-cyan-400"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="font-bold text-lg md:text-3xl lg:text-4xl text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200 leading-snug md:leading-tight tracking-tight">
              {news.allNews[0].title}
            </h2>

            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 md:mt-3 line-clamp-2 md:line-clamp-4 leading-relaxed">
              {news.allNews[0].content}
            </p>

            <div className="mt-5 md:mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5 md:gap-3 text-sm text-slate-500">
              <div className="hidden md:block shrink-0">
                <ClientAvatar name={news.allNews[0].author.fullName} />
              </div>
              <div className="flex flex-row items-center gap-2.5 md:block">
                <span className="font-semibold text-slate-700 dark:text-slate-300 md:text-slate-800 md:dark:text-slate-200 md:leading-none md:block">
                  {news.allNews[0].author.fullName}
                </span>
                <Dot size={12} className="text-slate-300 md:hidden" />
                <time
                  dateTime="ISO"
                  itemProp="datePublished"
                  className="text-xs text-slate-400 md:mt-1 md:block"
                >
                  {mainNewsDay} {mainNewsMonth}
                </time>
              </div>
            </div>
          </div>
        </Link>
      </article>

      <ul
        role="list"
        className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 mt-12 md:mt-10 md:border-t md:border-slate-100 md:dark:border-slate-800 md:pt-10"
      >
        {news.allNews.slice(1).map((singleNews) => {
          const { day, month } = formatDayAndMonthWords(singleNews.createdAt);
          return (
            <li key={singleNews._id} className="flex">
              <article itemScope itemType="https://schema.org/Article" className="flex flex-col w-full">
                <Link
                  href={`/news/${singleNews._id}`}
                  className="group flex flex-col h-full justify-between"
                >
                  <div className="w-full">
                    <figure className="relative aspect-[16/10] md:aspect-[4/3] overflow-hidden rounded-xl mb-4 bg-muted shadow-xs">
                      <Image
                        src={imageUrl + singleNews.image || CONTENT_PLACEHOLDER}
                        alt={singleNews.title}
                        fill
                        priority
                        unoptimized={isDev}
                        itemProp="image"
                        className="object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                      />
                    </figure>

                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {singleNews.tags.map((tag, index) => (
                        <span
                          key={tag + index}
                          className="text-[10px] uppercase tracking-wider bg-slate-100 dark:bg-slate-800/60 px-2.5 py-0.5 rounded-md font-bold text-slate-600 dark:text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3
                      className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200 line-clamp-2 leading-snug tracking-tight"
                      itemProp="headline"
                    >
                      {singleNews.title}
                    </h3>

                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed">
                      {singleNews.content}
                    </p>
                  </div>

                  <footer className="mt-5 pt-4 flex items-center gap-2.5 text-sm border-t border-slate-100 dark:border-slate-800 text-slate-500">
                    <span itemProp="author" className="font-semibold text-slate-700 dark:text-slate-300">
                      {singleNews.author.fullName}
                    </span>
                    <Dot size={12} className="text-slate-300" />
                    <time dateTime="ISO" itemProp="datePublished" className="text-xs text-slate-400">
                      {day} {month}
                    </time>
                  </footer>
                </Link>
              </article>
            </li>
          );
        })}
      </ul>

      {renderPagination()}
    </div>
  );
};

export default NewsList;