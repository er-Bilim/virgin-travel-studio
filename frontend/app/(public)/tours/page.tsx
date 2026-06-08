import ToursList from '@/components/public/tours/ToursList';
import {queryConfig, toursLimitPag} from '@/lib/constants';
import { getTourCategories, getTours } from '@/services/tours';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';


const Tours = async () => {
  const qc = new QueryClient(queryConfig);

  await Promise.all([
    qc.prefetchQuery({
      queryKey: ['tours', 1, toursLimitPag, null, undefined, true, undefined],
      queryFn: () =>
        getTours({ page: 1, limit: toursLimitPag, isPublished: true }),
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
