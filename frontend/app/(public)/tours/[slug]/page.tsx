import TourDetailView from '@/components/public/tours/TourDetailView';
import { getTourById } from '@/services/tours';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

interface Props {
  params: Promise<{ slug: string }>;
}

const Tour = async ({ params }: Props) => {

  const { slug } = await params;
  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: ['tour', slug],
    queryFn: () => getTourById(slug), 
  })

  const dehydrateQC = dehydrate(qc)

  return (
    <HydrationBoundary state={dehydrateQC}>
      <TourDetailView id={slug}/>
    </HydrationBoundary>
  );
}

export default Tour