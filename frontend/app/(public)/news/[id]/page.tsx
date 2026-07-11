import type { Metadata } from 'next';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

import NewsDetailView from '@/components/public/news/NewsDetailView';
import {
  buildMetadata,
  DEFAULT_SITE_DESCRIPTION,
} from '@/lib/seo';
import { getNewsById } from '@/services/news';
import { getPopularTours } from '@/services/tours';

interface Props {
  params: Promise<{ id: string }>;
}

export const generateMetadata = async ({
                                         params,
                                       }: Props): Promise<Metadata> => {
  const { id } = await params;

  try {
    const news = await getNewsById(id);

    return buildMetadata(
        `${news.title} | Virgin Travel Studio`,
        news.content || DEFAULT_SITE_DESCRIPTION,
        `/news/${id}`,
    );
  } catch {
    return buildMetadata(
        'Новость | Virgin Travel Studio',
        DEFAULT_SITE_DESCRIPTION,
        `/news/${id}`,
    );
  }
};

const NewsDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const qc = new QueryClient();
  const limit = 5;

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
        <NewsDetailView id={id} tourLimit={limit} />
      </HydrationBoundary>
  );
};

export default NewsDetailPage;