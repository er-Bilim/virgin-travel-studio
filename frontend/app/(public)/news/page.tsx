import type { Metadata } from 'next';

import NewsList from '@/components/public/news/NewsList';
import { buildMetadata } from '@/lib/seo';
import { getNews } from '@/services/news';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

type NewsPageProps = {
  searchParams: Promise<{
    page?: string;
    startDate?: string;
    endDate?: string;
  }>;
};

export const generateMetadata = async ({
  searchParams,
}: NewsPageProps): Promise<Metadata> => {
  const params = await searchParams;

  const parsedPage = Number.parseInt(params.page ?? '1', 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const canonicalPath = page > 1 ? `/news?page=${page}` : '/news';

  const title =
    page > 1
      ? `Новости — страница ${page} | Virgin Travel Studio`
      : 'Новости | Virgin Travel Studio';

  return buildMetadata(
    title,
    'Новости о путешествиях, полезные материалы, свежие маршруты и актуальные обновления от Virgin Travel Studio.',
    canonicalPath,
  );
};

const NewsPage = async ({ searchParams }: NewsPageProps) => {
  const qc = new QueryClient();

  const params = await searchParams;

  const startDate = params.startDate || null;
  const endDate = params.endDate || null;

  await qc.prefetchQuery({
    queryKey: [
      'news',
      1,
      7,
      undefined,
      'true',
      undefined,
      null,
      startDate,
      endDate,
    ],
    queryFn: () =>
      getNews({
        page: 1,
        limit: 7,
        isPublished: 'true',
        startDate,
        endDate,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NewsList />
    </HydrationBoundary>
  );
};

export const dynamic = 'force-dynamic';

export default NewsPage;

export const dynamic = 'force-dynamic';

export default NewsPage;