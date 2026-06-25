import TourDetailView from '@/components/public/tours/TourDetailView';
import { getTourById } from '@/services/tours';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { headers } from 'next/headers';

interface Props {
  params: Promise<{ slug: string }>;
}

const Tour = async ({ params }: Props) => {
  const headersList = await headers();
  const userIp =
    headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? '';

  const { slug } = await params;
  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: ['tour', slug],
    queryFn: () => getTourById(slug, userIp),
  });

  const dehydrateQC = dehydrate(qc);

  return (
    <HydrationBoundary state={dehydrateQC}>
      <TourDetailView id={slug} />
    </HydrationBoundary>
  );
};

export default Tour;
