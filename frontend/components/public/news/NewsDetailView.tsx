'use client';

import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import ClientAvatar from '@/components/shared/ClientAvatar';
import { Spinner } from '@/components/ui/spinner';
import { useGetSingleNews } from '@/lib/hooks/newsHooks';
import { toast } from 'sonner';
import {
  cn,
  formatDayAndMonthWords,
} from '../../../lib/utils';
import { Clock, Dot } from 'lucide-react';
import Image from 'next/image';
import { imageUrl, isDev } from '@/lib/constants';
import ShareButton from '../buttons/share/ShareButton';
import { usePathname } from 'next/navigation';

interface Props {
  id: string;
}

const NewsDetailView = ({ id }: Props) => {
  const pathname = usePathname();
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`;
  const { data: news, isLoading, isError } = useGetSingleNews(id);

  if (isLoading) {
    return <Spinner />;
  }

  if (isError || !news) {
    return toast.error('Что-то пошло не так');
  }

  const { day, month, year } = formatDayAndMonthWords(news.createdAt)

  const words: number = news.content.trim().split(/\s+/).length;

  const imageSrc: string = `${imageUrl}api/news/image/${news.image}`;

  console.log(imageSrc);

  const paragraphs: string[] = news.content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section className="mt-10">
      <Breadcrumbs
        items={[{ label: 'Новости', href: '/news' }, { label: news.title }]}
      />
      <article itemScope itemType="https://schema.org/NewsArticle">
        <header className='border-b border-border pb-7'>
          <ul
            aria-label="Теги статьи"
            role="list"
            className="flex flex-row gap-3 lowercase"
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

          <h1 itemProp="headline" className="mt-5 font-bold text-3xl">
            {news.title}
          </h1>

          <div className="text-sm flex flex-row justify-between items-center">
            <div className="flex flex-row items-center gap-3 mt-5">
              <ClientAvatar name={news.author.fullName} size="lg" />
              <div className="flex flex-col text-[var(--primary)]">
                <p className="font-semibold">{news.author.fullName}</p>
                <div className="flex flex-row items-center gap-2 text-gray-500">
                  <div>
                    <p className="flex gap-1 text-gray-500">
                      <span className="font-semibold">
                        {day}
                      </span>
                      <span>{month}</span>
                      <span className="font-semibold">
                        {year}
                      </span>
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
          <figure className="relative my-10 w-full aspect-video">
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

        <div itemProp="articleBody" className="prose prose-slate max-w-none">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className={cn(
                'text-[var(--primary)] leading-relaxed',
                index === 0
                  ? 'text-[1.2rem] font-semibold mb-4'
                  : 'text-base mb-3.5',
              )}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      <div className="my-6 border-t border-border pt-7 flex flex-row justify-between w-full items-center">
        <p className="text-sm text-gray-500">Понравилось? Поделитесь:</p>
        <div className="flex flex-row gap-2">
          <ShareButton
            platform="telegram"
            url={url}
            title="telegram"
            variant="labeled"
            className="px-5 py-3 size-1/3 bg-slate-50"
          />
          <ShareButton
            platform="whatsapp"
            url={url}
            title="whatsapp"
            variant="labeled"
            className="px-5 py-3 size-1/3 bg-slate-50"
          />
          <ShareButton
            platform="copy"
            url={url}
            title="copy"
            variant="labeled"
            className="px-5 py-3 size-2/5 bg-slate-50 cursor-pointer"
          />
        </div>
      </div>
    </section>
  );
};

export default NewsDetailView;
