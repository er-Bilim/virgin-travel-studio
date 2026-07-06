import NewsList from '@/components/public/news/NewsList';
import { getNews } from '@/services/news';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

type Props = {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
  }>;
};

const NewsPage = async ({ searchParams }: Props) => {
  const qc = new QueryClient();
  const params = await searchParams;

  const startDate = params.startDate || null;
  const endDate = params.endDate || null;

  await qc.prefetchQuery({
    queryKey: ['news', 1, 7, undefined, 'true', undefined, null, startDate, endDate],
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