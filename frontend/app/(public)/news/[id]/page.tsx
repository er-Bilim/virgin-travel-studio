import NewsDetailView from '@/components/public/news/NewsDetailView';
import { getNewsById } from '@/services/news';
import { getPopularTours } from '@/services/tours';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

interface Props {
  params: Promise<{ id: string }>;
}

const NewsDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const qc = new QueryClient();
  const limit: number = 3;

  await Promise.all([
    qc.prefetchQuery({
      queryKey: ['news', 'single', id],
      queryFn: () => getNewsById(id),
    }),
    qc.prefetchQuery({
      queryKey: ['tours', 'popular', limit],
      queryFn: () => getPopularTours(limit),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NewsDetailView id={id} tourLimit={limit}/>
    </HydrationBoundary>
  );
};

export default NewsDetailPage;
