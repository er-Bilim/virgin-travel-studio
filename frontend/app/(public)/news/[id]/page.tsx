import NewsDetailView from '@/components/public/news/NewsDetailView';
import { getNewsById } from '@/services/news';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

interface Props {
  params: Promise<{ id: string }>;
}

const NewsDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: ['news', 'single', id],
    queryFn: () =>  getNewsById(id)
  })

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NewsDetailView id={id}/>
    </HydrationBoundary>
  );
};

export default NewsDetailPage;
