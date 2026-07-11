import type { Metadata } from 'next';
import ToursList from '@/components/public/tours/ToursList';
import { queryConfig, toursLimitPag } from '@/lib/constants';
import { buildMetadata } from '@/lib/seo';
import { getTourCategories, getTours } from '@/services/tours';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

type ToursPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export const generateMetadata = async ({
                                         searchParams,
                                       }: ToursPageProps): Promise<Metadata> => {
  const params = await searchParams;
  const parsedPage = Number.parseInt(params.page ?? '1', 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const canonicalPath = page > 1 ? `/tours?page=${page}` : '/tours';

  const title =
      page > 1
          ? `Туры — страница ${page} | Virgin Travel Studio`
          : 'Туры | Virgin Travel Studio';

  return buildMetadata(
      title,
      'Выберите готовый тур от Virgin Travel Studio: популярные направления, продуманные маршруты и незабываемые путешествия.',
      canonicalPath,
  );
};

const Tours = async () => {
  const qc = new QueryClient(queryConfig);

  await Promise.all([
    qc.prefetchQuery({
      queryKey: ['tours', 1, toursLimitPag, null, undefined, true, undefined],
      queryFn: () =>
          getTours({
            page: 1,
            limit: toursLimitPag,
            isPublished: true,
          }),
    }),
    qc.prefetchQuery({
      queryKey: ['tours', 'categories'],
      queryFn: () => getTourCategories(),
    }),
  ]);

  const dehydrated = dehydrate(qc);

  return (
      <HydrationBoundary state={dehydrated}>
        <ToursList />
      </HydrationBoundary>
  );
};

export default Tours;