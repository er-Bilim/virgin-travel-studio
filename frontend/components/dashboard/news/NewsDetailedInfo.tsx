import type { NewsFields } from '@/types/news';
import { imageUrl, isDev } from '@/lib/constants';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import Image from 'next/image';

interface Props {
  oneNews: NewsFields;
}

const NewsDetailedInfo: React.FC<Props> = ({ oneNews }) => {
  dayjs.locale('ru');

  return (
    <div className="space-y-6">
      {oneNews.image && (
        <div className="relative flex h-[400px] w-full items-center justify-center">
          <Image
            src={`${imageUrl}api/news/image/${oneNews.image}`}
            alt={oneNews.title}
            fill
            sizes="(min-width: 768px) 800px, 100vw"
            unoptimized={isDev}
            className="rounded-xl object-contain"
          />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-3xl font-bold">{oneNews.title}</h2>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>
            Автор:{' '}
            <span className="font-medium text-foreground">
              {oneNews.author.fullName}
            </span>
          </span>

          <span>{dayjs(oneNews.createdAt).format('DD MMMM YYYY')}</span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              oneNews.isPublished
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {oneNews.isPublished ? 'Опубликовано' : 'Черновик'}
          </span>
        </div>

        {oneNews.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {oneNews.tags.map((tag) => (
              <span key={tag} className="rounded-full border px-3 py-1 text-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap leading-7">{oneNews.content}</p>
        </div>

        <div className="border-t pt-4 text-xs text-muted-foreground">
          <p>
            Создано: {dayjs(oneNews.createdAt).format('DD MMMM YYYY (HH:mm)')}
          </p>

          <p>
            Обновлено: {dayjs(oneNews.updatedAt).format('DD MMMM YYYY (HH:mm)')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailedInfo;
