'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Dot, Newspaper, AlertCircle, AlignStartVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import ClientAvatar from '@/components/shared/ClientAvatar';
import { PaginationCustom } from '@/components/pagination/PaginationCustom';
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
    refetch: refetchNews,
  } = useNews({ page, limit, tags: tag });

  const {
    data: tags,
    isLoading: tagsLoading,
    isError: tagsError,
    refetch: refetchTags,
  } = useGetNewsTags();

  const tagsSettingsCombobox = {
    title: 'Все темы',
    icon: AlignStartVertical,
    queryParamsName: 'tags',
    searchPlaceholder: 'Поиск темы',
  };

  const selectedTag = tags ? tags.find((tagItem) => tagItem.tag === tag) : null;

  const metadata = news?.metadata;

  useEffect(() => {
    if (newsError || tagsError) {
      toast.error('Не удалось загрузить новостные данные');
    }
  }, [newsError, tagsError]);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleRetry = () => {
    refetchNews();
    refetchTags();
  };

  if (newsPending) {
    return <NewsSkeleton />;
  }

  if (newsError || !news || tagsError || !tags) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4 max-w-md mx-auto">
        <div className="bg-red-50 text-red-500 rounded-full p-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <p className="font-semibold text-lg text-gray-900">Ошибка загрузки</p>
          <p className="text-muted-foreground text-sm mt-1">
            Произошла ошибка при получении свежих статей. Проверьте соединение с
            сетью.
          </p>
        </div>
        <button
          onClick={handleRetry}
          className="mt-2 px-5 py-2.5 bg-[#1E2B6D] text-white font-medium text-sm rounded-xl hover:bg-[#152054] transition"
        >
          Попробовать снова
        </button>
      </div>
    );
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

  const { day: mainNewsDay, month: mainNewsMonth } = formatDayAndMonthWords(
    news.allNews[0].createdAt,
  );

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
    <div className="px-4 max-w-7xl mx-auto w-full">
      <Breadcrumbs
        className="mt-5"
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Новости', href: '/news' },
        ]}
      />

      <header className="mt-8">
        <p className="text-cyan-800 font-semibold uppercase text-sm tracking-wider">
          {settings?.newsPage?.badge || 'Журнал путешествий'}
        </p>

        <h1 className="font-black text-navy-800 text-4xl mt-3 md:text-5xl">
          {settings?.newsPage?.title || 'Новости и истории'}
        </h1>

        <p className="text-gray-500 mt-3 max-w-2xl whitespace-pre-line text-base">
          {settings?.newsPage?.subtitle ||
            'Свежие маршруты, обновления виз, истории путешественников и подборки скрытых мест.'}
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

      <article className="group mt-10 border-t pt-10">
        <Link
          href={`/news/${news.allNews[0]._id}`}
          className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8"
        >
          <figure className="relative aspect-[16/10] lg:aspect-[4/3] overflow-hidden rounded-2xl w-full bg-gray-100">
            <Image
              src={
                news.allNews[0].image
                  ? `${imageUrl}${news.allNews[0].image}`
                  : CONTENT_PLACEHOLDER
              }
              alt={news.allNews[0].title}
              fill
              priority
              unoptimized={isDev}
              itemProp="image"
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
            <div className="text-[#1E2B6D] z-10 absolute top-5 left-5 uppercase text-xs bg-white/90 backdrop-blur-sm shadow-sm rounded-xl py-1.5 px-4 font-bold tracking-wider">
              главное
            </div>
          </figure>

          <div className="flex flex-col  gap-4">
            <div className="flex flex-wrap gap-2">
              {news.allNews[0].tags.map((tag, index) => (
                <span
                  key={tag + index}
                  className="text-xs uppercase bg-slate-100 px-3 py-1 rounded-xl font-bold text-cyan-800 tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="font-black text-2xl md:text-4xl text-gray-900 leading-tight group-hover:text-[#1E2B6D] transition-colors">
              {news.allNews[0].title}
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              {truncateText(news.allNews[0].content, 200)}
            </p>

            <div className="mt-auto flex flex-row gap-1 items-center mt-2">
              <div className="flex flex-row items-center gap-2">
                <ClientAvatar name={news.allNews[0].author.fullName} />
                <p className="font-semibold text-sm text-gray-700">
                  {news.allNews[0].author.fullName}
                </p>
              </div>
              <Dot size={16} className="text-gray-400" />
              <time
                dateTime={news.allNews[0].createdAt}
                itemProp="datePublished"
                className="flex flex-row gap-1 text-sm text-gray-500 font-medium"
              >
                <span>{mainNewsDay}</span>
                <span>{mainNewsMonth}</span>
              </time>
            </div>
          </div>
        </Link>
      </article>

      <ul
        role="list"
        className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 mt-16 border-t pt-12"
      >
        {news.allNews.map((singleNews, index) => {
          if (index === 0) return null;

          const { day, month } = formatDayAndMonthWords(singleNews.createdAt);
          return (
            <li key={singleNews._id} className="group">
              <article
                itemScope
                itemType="https://schema.org/Article"
                className="flex flex-col h-full"
              >
                <Link
                  href={`/news/${singleNews._id}`}
                  className="flex flex-col h-full"
                >
                  <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-4 bg-gray-100">
                    <Image
                      src={
                        singleNews.image
                          ? `${imageUrl}${singleNews.image}`
                          : CONTENT_PLACEHOLDER
                      }
                      alt={singleNews.title}
                      fill
                      unoptimized={isDev}
                      itemProp="image"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </figure>

                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    {singleNews.tags.map((tag, index) => (
                      <span
                        key={tag + index}
                        className="text-[11px] uppercase bg-slate-100 px-2.5 py-0.5 rounded-lg font-bold text-cyan-800 tracking-wide"
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

                  <p className="text-gray-600 text-sm mt-2 line-clamp-2 mb-4 leading-relaxed">
                    {truncateText(singleNews.content, 150)}
                  </p>

                  <footer className="mt-auto pt-4 flex flex-row items-center gap-1 text-sm border-t text-gray-500 font-medium">
                    <span itemProp="author" className="text-gray-700">
                      {singleNews.author.fullName}
                    </span>
                    <Dot size={16} className="text-gray-400" />
                    <time
                      dateTime={singleNews.createdAt}
                      itemProp="datePublished"
                      className="flex gap-1"
                    >
                      <span>{day}</span>
                      <span>{month}</span>
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
